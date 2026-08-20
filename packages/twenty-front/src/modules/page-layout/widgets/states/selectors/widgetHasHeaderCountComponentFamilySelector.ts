import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { widgetHeaderCountComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderCountComponentFamilyState';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const widgetHasHeaderCountComponentFamilySelector =
  createAtomComponentFamilySelector<boolean, string>({
    key: 'widgetHasHeaderCountComponentFamilySelector',
    componentInstanceContext: PageLayoutComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) => {
        const widgetHeaderCount = get(widgetHeaderCountComponentFamilyState, {
          instanceId,
          familyKey,
        });

        return isDefined(widgetHeaderCount);
      },
  });
