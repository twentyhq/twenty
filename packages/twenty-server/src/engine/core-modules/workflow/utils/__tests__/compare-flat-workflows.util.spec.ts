import {
  CoreWorkflowOrderByDirection,
  CoreWorkflowOrderByField,
} from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { compareFlatWorkflows } from 'src/engine/core-modules/workflow/utils/compare-flat-workflows.util';

const flatWorkflows = [
  { id: 'c', name: 'Beta', updatedAt: '2026-01-02T00:00:00.000Z' },
  { id: 'a', name: null, updatedAt: '2026-01-03T00:00:00.000Z' },
  { id: 'b', name: 'Alpha', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'd', name: 'Beta', updatedAt: '2026-01-02T00:00:00.000Z' },
];

const sortIds = ({
  orderBy,
  orderByDirection,
}: {
  orderBy: CoreWorkflowOrderByField;
  orderByDirection: CoreWorkflowOrderByDirection;
}) =>
  [...flatWorkflows]
    .sort(compareFlatWorkflows({ orderBy, orderByDirection }))
    .map(({ id }) => id);

describe('compareFlatWorkflows', () => {
  it('should sort by name ascending with unnamed workflows last and ids breaking ties', () => {
    expect(
      sortIds({
        orderBy: CoreWorkflowOrderByField.NAME,
        orderByDirection: CoreWorkflowOrderByDirection.ASC,
      }),
    ).toEqual(['b', 'c', 'd', 'a']);
  });

  it('should keep unnamed workflows last when sorting by name descending', () => {
    expect(
      sortIds({
        orderBy: CoreWorkflowOrderByField.NAME,
        orderByDirection: CoreWorkflowOrderByDirection.DESC,
      }),
    ).toEqual(['d', 'c', 'b', 'a']);
  });

  it('should sort by updatedAt descending with ids breaking ties', () => {
    expect(
      sortIds({
        orderBy: CoreWorkflowOrderByField.UPDATED_AT,
        orderByDirection: CoreWorkflowOrderByDirection.DESC,
      }),
    ).toEqual(['a', 'd', 'c', 'b']);
  });
});
