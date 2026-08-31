import { CoreWorkflowStatus } from 'src/engine/core-modules/workflow/dtos/core-workflow-filter.input';
import {
  buildCoreWorkflowHasAnyOfStatusesPredicate,
  CORE_WORKFLOW_HAS_ANY_STATUS_PREDICATE,
} from 'src/engine/core-modules/workflow/utils/build-core-workflow-status-predicate.util';

describe('buildCoreWorkflowHasAnyOfStatusesPredicate', () => {
  it('should build a single predicate per requested status', () => {
    expect(
      buildCoreWorkflowHasAnyOfStatusesPredicate([CoreWorkflowStatus.DRAFT]),
    ).toBe(`(coalesce(bool_or(v.status = 'DRAFT'), false))`);

    expect(
      buildCoreWorkflowHasAnyOfStatusesPredicate([
        CoreWorkflowStatus.DEACTIVATED,
      ]),
    ).toBe(
      `((NOT coalesce(bool_or(v.status = 'ACTIVE'), false) AND coalesce(bool_or(v.status = 'DEACTIVATED'), false)))`,
    );
  });

  it('should join multiple requested statuses with OR', () => {
    expect(
      buildCoreWorkflowHasAnyOfStatusesPredicate([
        CoreWorkflowStatus.DRAFT,
        CoreWorkflowStatus.ACTIVE,
      ]),
    ).toBe(
      `(coalesce(bool_or(v.status = 'DRAFT'), false) OR coalesce(bool_or(v.status = 'ACTIVE'), false))`,
    );
  });

  it('should expose a predicate covering every status', () => {
    expect(CORE_WORKFLOW_HAS_ANY_STATUS_PREDICATE).toBe(
      `(coalesce(bool_or(v.status = 'DRAFT'), false) OR coalesce(bool_or(v.status = 'ACTIVE'), false) OR (NOT coalesce(bool_or(v.status = 'ACTIVE'), false) AND coalesce(bool_or(v.status = 'DEACTIVATED'), false)))`,
    );
  });
});
