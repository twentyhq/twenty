import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { widgetHeaderInfoComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderInfoComponentFamilyState';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const widgetHasHeaderInfoComponentFamilySelector =
  createAtomComponentFamilySelector<boolean, string>({
    key: 'widgetHasHeaderInfoComponentFamilySelector',
    componentInstanceContext: PageLayoutComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) => {
        const widgetHeaderInfo = get(widgetHeaderInfoComponentFamilyState, {
          instanceId,
          familyKey,
        });

        return (
          isDefined(widgetHeaderInfo?.count) ||
          isNonEmptyArray(widgetHeaderInfo?.actions)
        );
      },
  });
