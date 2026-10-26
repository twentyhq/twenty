import json
import pathlib
import statistics
import subprocess


DIRECTORY = pathlib.Path(__file__).resolve().parent
CONNECTION = [
    'psql', '-h', 'localhost', '-p', '5432',
    '-d', 'permissions_rework_bench_20261026',
    '-X', '-A', '-t', '-v', 'ON_ERROR_STOP=1',
]


def execute(statement):
    result = subprocess.run(
        CONNECTION + ['-c', "SET statement_timeout = '30s'; " + statement],
        text=True, capture_output=True, check=True,
    )
    return json.loads(result.stdout.removeprefix('SET\n').strip())


results = []
baseline_results = json.loads((DIRECTORY / 'separate-access-results.json').read_text())
for baseline in baseline_results:
    narrow_query = baseline['query'].replace(
        'company.id, company.created_at, company.name, company.city',
        'company.id, company.created_at',
    )
    statement = (
        'SELECT full_record.id, full_record.created_at, full_record.name, full_record.city\n'
        'FROM (' + narrow_query + ') AS page\n'
        'JOIN permission_company AS full_record ON full_record.id = page.id\n'
        'ORDER BY page.created_at DESC, page.id DESC'
    )
    expected = execute('SELECT json_agg(page) FROM (' + baseline['query'] + ') AS page')
    rows = execute('SELECT json_agg(page) FROM (' + statement + ') AS page')
    assert rows == expected, (baseline['case'], baseline['layout'], 'result mismatch')
    plans = [execute(
        'EXPLAIN (ANALYZE, BUFFERS, TIMING OFF, FORMAT JSON) ' + statement
    )[0] for _ in range(3)]
    result = {
        'case': baseline['case'], 'layout': baseline['layout'], 'query': statement,
        'returned_rows': len(rows or []), 'equivalent_results': True,
        'median_execution_ms': statistics.median(plan['Execution Time'] for plan in plans),
        'plans': plans,
    }
    results.append(result)
    print(baseline['case'], baseline['layout'], result['median_execution_ms'], flush=True)
    (DIRECTORY / 'separate-access-late-fetch-results.json').write_text(json.dumps(results, indent=2) + '\n')

print('All ordered result sets match their baseline and therefore each other.', flush=True)
