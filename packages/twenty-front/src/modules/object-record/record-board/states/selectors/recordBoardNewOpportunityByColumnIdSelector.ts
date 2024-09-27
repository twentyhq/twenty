import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';
import {
    NewOpportunity,
    recordBoardNewOpportunityByColumnIdComponentFamilyState,
} from '../recordBoardNewOpportunityByColumnIdComponentFamilyState';

export const recordBoardNewOpportunityByColumnIdSelector =
  createComponentFamilySelector<NewOpportunity, string>({
    key: 'recordBoardNewOpportunityByColumnIdSelector',
    get:
      ({ familyKey, scopeId }: { familyKey: string; scopeId: string }) =>
      ({ get }) => {
        return get(
          recordBoardNewOpportunityByColumnIdComponentFamilyState({
            familyKey,
            scopeId,
          }),
        ) as NewOpportunity;
      },
    set:
      ({ familyKey, scopeId }: { familyKey: string; scopeId: string }) =>
      ({ set }, newValue) => {
        set(
          recordBoardNewOpportunityByColumnIdComponentFamilyState({
            familyKey,
            scopeId,
          }),
          newValue as NewOpportunity,
        );
      },
  });
