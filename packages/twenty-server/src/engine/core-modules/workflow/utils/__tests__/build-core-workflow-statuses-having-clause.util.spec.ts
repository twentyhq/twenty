import { CoreWorkflowStatus } from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { buildCoreWorkflowStatusesHavingClause } from 'src/engine/core-modules/workflow/utils/build-core-workflow-statuses-having-clause.util';
import { computeCoreWorkflowStatuses } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses.util';

type VersionFlags = {
  hasDraftVersion: boolean;
  hasActiveVersion: boolean;
  hasDeactivatedVersion: boolean;
};

const ALL_VERSION_FLAG_COMBINATIONS: VersionFlags[] = [false, true].flatMap(
  (hasDraftVersion) =>
    [false, true].flatMap((hasActiveVersion) =>
      [false, true].map((hasDeactivatedVersion) => ({
        hasDraftVersion,
        hasActiveVersion,
        hasDeactivatedVersion,
      })),
    ),
);

// evaluates the generated SQL predicate against in-memory version flags by
// substituting the aggregate expressions with their boolean values
const evaluateHavingClause = (
  havingClause: string,
  { hasDraftVersion, hasActiveVersion, hasDeactivatedVersion }: VersionFlags,
): boolean => {
  const booleanExpression = havingClause
    .split(`coalesce(bool_or(v.status = 'DRAFT'), false)`)
    .join(String(hasDraftVersion))
    .split(`coalesce(bool_or(v.status = 'ACTIVE'), false)`)
    .join(String(hasActiveVersion))
    .split(`coalesce(bool_or(v.status = 'DEACTIVATED'), false)`)
    .join(String(hasDeactivatedVersion))
    .split('NOT')
    .join('!')
    .split('AND')
    .join('&&')
    .split('OR')
    .join('||');

  return new Function(`return ${booleanExpression};`)() as boolean;
};

describe('buildCoreWorkflowStatusesHavingClause', () => {
  it('should build a single predicate per requested status', () => {
    expect(
      buildCoreWorkflowStatusesHavingClause([CoreWorkflowStatus.DRAFT]),
    ).toBe(`coalesce(bool_or(v.status = 'DRAFT'), false)`);

    expect(
      buildCoreWorkflowStatusesHavingClause([CoreWorkflowStatus.DEACTIVATED]),
    ).toBe(
      `(NOT coalesce(bool_or(v.status = 'ACTIVE'), false) AND coalesce(bool_or(v.status = 'DEACTIVATED'), false))`,
    );
  });

  it('should join multiple requested statuses with OR', () => {
    expect(
      buildCoreWorkflowStatusesHavingClause([
        CoreWorkflowStatus.DRAFT,
        CoreWorkflowStatus.ACTIVE,
      ]),
    ).toBe(
      `coalesce(bool_or(v.status = 'DRAFT'), false) OR coalesce(bool_or(v.status = 'ACTIVE'), false)`,
    );
  });

  it.each(Object.values(CoreWorkflowStatus))(
    'should match exactly the workflows whose derived statuses contain %s',
    (status) => {
      const havingClause = buildCoreWorkflowStatusesHavingClause([status]);

      for (const versionFlags of ALL_VERSION_FLAG_COMBINATIONS) {
        const derivedStatuses: string[] =
          computeCoreWorkflowStatuses(versionFlags);

        expect(evaluateHavingClause(havingClause, versionFlags)).toBe(
          derivedStatuses.includes(status),
        );
      }
    },
  );
});
