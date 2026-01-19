import { graphWidgetHoveredSliceIndexComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetHoveredSliceIndexComponentState';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const graphWidgetIsSliceHoveredComponentFamilySelector =
  createComponentFamilySelector<boolean, string>({
    key: 'graphWidgetIsSliceHoveredComponentFamilySelector',
    componentInstanceContext: WidgetComponentInstanceContext,
    get:
      ({ instanceId, familyKey }: { instanceId: string; familyKey: string }) =>
      ({ get }) => {
        const hoveredSliceIndex = get(
          graphWidgetHoveredSliceIndexComponentState.atomFamily({ instanceId }),
        );

        return isDefined(hoveredSliceIndex) && hoveredSliceIndex === familyKey;
      },
  });
