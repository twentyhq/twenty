import json
import pathlib
import statistics
import subprocess
import uuid


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
    return result.stdout.removeprefix('SET\n').strip()


def group_array(numbers):
    return 'ARRAY[' + ','.join(
        "'" + str(uuid.UUID(int=number)) + "'::uuid" for number in numbers
    ) + ']'


def query(layout, groups, city, cursor=None):
    clauses = ['company.deleted_at IS NULL']
    if city is not None:
        clauses.append("company.city = '" + city + "'")
    if cursor is not None:
        clauses.append(
            "(company.created_at, company.id) < ('" + cursor['created_at']
            + "'::timestamptz, '" + cursor['id'] + "'::uuid)"
        )
    group_ids = group_array(groups)
    if layout == 'on_record':
        clauses.append('company.readable_access_group_ids && ' + group_ids)
    elif layout == 'separate_row':
        clauses.append(
            'EXISTS (SELECT 1 FROM permission_company_access_row AS access '
            'WHERE access.record_id = company.id '
            'AND access.readable_access_group_ids && ' + group_ids + ')'
        )
    else:
        clauses.append(
            'EXISTS (SELECT 1 FROM permission_company_access_edge AS access '
            'WHERE access.record_id = company.id '
            'AND access.access_group_id = ANY (' + group_ids + '))'
        )
    return (
        'SELECT company.id, company.created_at, company.name, company.city\n'
        'FROM permission_company AS company\nWHERE '
        + '\n  AND '.join(clauses)
        + '\nORDER BY company.created_at DESC, company.id DESC\nLIMIT 50'
    )


cases = [
    {'name': 'city_dense', 'groups': [1], 'city': 'City-42'},
    {'name': 'city_sparse', 'groups': [100000042], 'city': 'City-42'},
    {'name': 'city_oldest_only', 'groups': [2], 'city': 'City-42'},
    {'name': 'city_overlapping_groups', 'groups': [1, 100000042], 'city': 'City-42'},
    {'name': 'global_sparse', 'groups': [100000042], 'city': None},
    {'name': 'global_oldest_only', 'groups': [2], 'city': None},
]

for name, groups in [('city_dense_next_page', [1]), ('city_sparse_next_page', [100000042])]:
    first_query = query('on_record', groups, 'City-42')
    first_page = json.loads(execute(
        'SELECT json_agg(page) FROM (' + first_query + ') AS page'
    ))
    cases.append({
        'name': name, 'groups': groups, 'city': 'City-42',
        'cursor': first_page[-1],
    })

results = []
query_file = []
for case in cases:
    expected = None
    for layout in ['on_record', 'separate_row', 'separate_edges']:
        statement = query(layout, case['groups'], case['city'], case.get('cursor'))
        query_file.append('-- ' + case['name'] + ': ' + layout + '\n' + statement + ';')
        rows = json.loads(execute('SELECT json_agg(page) FROM (' + statement + ') AS page')) or []
        if expected is None:
            expected = rows
        assert rows == expected, (case['name'], layout, 'result mismatch')
        plans = []
        for repetition in range(3):
            plan = json.loads(execute(
                'EXPLAIN (ANALYZE, BUFFERS, TIMING OFF, FORMAT JSON) ' + statement
            ))[0]
            plans.append(plan)
        result = {
            'case': case['name'], 'layout': layout, 'query': statement,
            'returned_rows': len(rows), 'equivalent_results': True,
            'median_execution_ms': statistics.median(plan['Execution Time'] for plan in plans),
            'plans': plans,
        }
        results.append(result)
        print(case['name'], layout, len(rows), result['median_execution_ms'], flush=True)
        (DIRECTORY / 'separate-access-results.json').write_text(json.dumps(results, indent=2) + '\n')

(DIRECTORY / 'separate-access-queries.sql').write_text('\n\n'.join(query_file) + '\n')
print('All ordered result sets match across layouts.', flush=True)
