import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const numberOfvisibleTableColumnsComponentSelector =
  createComponentSelectorV2({
    key: 'numberOfvisibleTableColumnsComponentSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const columns = get(
          visibleTableColumnsComponentSelector.selectorFamily({ instanceId }),
        );

        return columns.length;
      },
  });
