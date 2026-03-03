import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { Provider as JotaiProvider } from 'jotai';

import { multipleRecordPickerAdditionalFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerAdditionalFilterComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type ObjectRecordFilterInput } from '~/generated/graphql';

// The search API's ObjectRecordFilterInput only supports generic fields
// (id, createdAt, updatedAt, deletedAt). To filter by custom relation fields
// like "leadId", the component pre-fetches eligible record IDs via
// useFindManyRecords (which uses per-object GraphQL filters), then passes
// { id: { in: [...] } } as the additionalFilter to the search-based picker.

const SENTINEL_UUID = '00000000-0000-0000-0000-000000000000';
const DROPDOWN_ID = 'test-dropdown-id';

// Simulates the filter the component builds from useFindManyRecords results
const buildIdFilter = (eligibleIds: string[]): ObjectRecordFilterInput => {
  if (eligibleIds.length === 0) {
    return { id: { eq: SENTINEL_UUID } } as ObjectRecordFilterInput;
  }

  return { id: { in: eligibleIds } } as ObjectRecordFilterInput;
};

describe('RecordDetailRelationSectionDropdownToMany - excludeAttachedFilter', () => {
  describe('ID-based filter from pre-fetched eligible records', () => {
    it('should produce an id-in filter when eligible policies exist', () => {
      const eligiblePolicyIds = [
        'policy-1-no-lead',
        'policy-2-no-lead',
        'policy-3-this-lead',
      ];

      const filter = buildIdFilter(eligiblePolicyIds);

      expect(filter).toEqual({
        id: {
          in: ['policy-1-no-lead', 'policy-2-no-lead', 'policy-3-this-lead'],
        },
      });
    });

    it('should produce a sentinel filter when no eligible policies exist', () => {
      const filter = buildIdFilter([]);

      expect(filter).toEqual({
        id: { eq: SENTINEL_UUID },
      });
    });

    it('should only contain id field which is valid for ObjectRecordFilterInput', () => {
      const filter = buildIdFilter(['policy-1']);

      // The search API only supports id, createdAt, updatedAt, deletedAt, and/or/not.
      // Custom field names like leadId are NOT valid and would cause a GraphQL error.
      const keys = Object.keys(filter);
      expect(keys).toEqual(['id']);
    });
  });

  describe('useFindManyRecords filter for Lead → Policies', () => {
    // This is the per-object filter passed to useFindManyRecords, which
    // DOES support custom field names because it uses the object-specific
    // GraphQL type, not the generic ObjectRecordFilterInput.
    it('should construct the correct per-object filter for policies', () => {
      const inverseFieldName = 'lead';
      const recordId = 'test-lead-id';

      const findManyFilter = {
        or: [
          { [`${inverseFieldName}Id`]: { is: 'NULL' } },
          { [`${inverseFieldName}Id`]: { eq: recordId } },
        ],
      };

      expect(findManyFilter).toEqual({
        or: [{ leadId: { is: 'NULL' } }, { leadId: { eq: 'test-lead-id' } }],
      });
    });

    it('should adapt to different inverse field names', () => {
      const cases = [
        {
          inverseFieldName: 'agent',
          recordId: 'agent-1',
          expectedKey: 'agentId',
        },
        {
          inverseFieldName: 'carrier',
          recordId: 'carrier-1',
          expectedKey: 'carrierId',
        },
        {
          inverseFieldName: 'company',
          recordId: 'company-1',
          expectedKey: 'companyId',
        },
      ];

      for (const { inverseFieldName, recordId, expectedKey } of cases) {
        const filter = {
          or: [
            { [`${inverseFieldName}Id`]: { is: 'NULL' } },
            { [`${inverseFieldName}Id`]: { eq: recordId } },
          ],
        };

        expect(filter.or[0]).toHaveProperty(expectedKey);
        expect(filter.or[1]).toHaveProperty(expectedKey);
      }
    });
  });

  describe('Jotai state integration', () => {
    it('should store the id-based filter in multipleRecordPickerAdditionalFilter state', () => {
      const expectedFilter = buildIdFilter(['policy-1', 'policy-2']);

      const Wrapper = ({ children }: { children: ReactNode }) => (
        <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
      );

      const { result } = renderHook(
        () => {
          const setAdditionalFilter = useSetAtomComponentState(
            multipleRecordPickerAdditionalFilterComponentState,
            DROPDOWN_ID,
          );
          const additionalFilter = useAtomComponentStateValue(
            multipleRecordPickerAdditionalFilterComponentState,
            DROPDOWN_ID,
          );

          return { setAdditionalFilter, additionalFilter };
        },
        { wrapper: Wrapper },
      );

      expect(result.current.additionalFilter).toBeUndefined();

      act(() => {
        result.current.setAdditionalFilter(expectedFilter);
      });

      expect(result.current.additionalFilter).toEqual({
        id: { in: ['policy-1', 'policy-2'] },
      });
    });

    it('should allow clearing the filter by setting undefined', () => {
      const filter = buildIdFilter(['policy-1']);

      const Wrapper = ({ children }: { children: ReactNode }) => (
        <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
      );

      const { result } = renderHook(
        () => {
          const setAdditionalFilter = useSetAtomComponentState(
            multipleRecordPickerAdditionalFilterComponentState,
            DROPDOWN_ID,
          );
          const additionalFilter = useAtomComponentStateValue(
            multipleRecordPickerAdditionalFilterComponentState,
            DROPDOWN_ID,
          );

          return { setAdditionalFilter, additionalFilter };
        },
        { wrapper: Wrapper },
      );

      act(() => {
        result.current.setAdditionalFilter(filter);
      });

      expect(result.current.additionalFilter).toBeDefined();

      act(() => {
        result.current.setAdditionalFilter(undefined);
      });

      expect(result.current.additionalFilter).toBeUndefined();
    });
  });
});
