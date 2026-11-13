import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RECORD_INDEX_ALL_TAB_ID } from '@/object-record/record-index-tab/constants/RecordIndexAllTabId';
import { RECORD_INDEX_NO_VALUE_TAB_ID } from '@/object-record/record-index-tab/constants/RecordIndexNoValueTabId';
import { type RecordIndexTab } from '@/object-record/record-index-tab/types/RecordIndexTab';
import { type ViewTab } from '@/views/types/ViewTab';
import { ViewTabType } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

type ComputeRecordIndexTabsArgs = {
  recordIndexTabFieldMetadataItem:
    | Pick<FieldMetadataItem, 'options'>
    | null
    | undefined;
  viewTabs: ViewTab[];
};

type RecordIndexTabWithOrder = RecordIndexTab & {
  position: number;
  defaultPosition: number;
};

const sortByPosition = (
  firstTab: RecordIndexTabWithOrder,
  secondTab: RecordIndexTabWithOrder,
) =>
  firstTab.position - secondTab.position ||
  firstTab.defaultPosition - secondTab.defaultPosition;

const removeOrder = ({
  position: _position,
  defaultPosition: _defaultPosition,
  ...recordIndexTab
}: RecordIndexTabWithOrder): RecordIndexTab => recordIndexTab;

// Field value, No value and All rows only override their default place and visibility, so a missing row keeps the default
export const computeRecordIndexTabs = ({
  recordIndexTabFieldMetadataItem,
  viewTabs,
}: ComputeRecordIndexTabsArgs): RecordIndexTab[] => {
  const allViewTab = viewTabs.find(({ type }) => type === ViewTabType.ALL);

  if (isDefined(recordIndexTabFieldMetadataItem)) {
    const options = [...(recordIndexTabFieldMetadataItem.options ?? [])].sort(
      (firstOption, secondOption) =>
        firstOption.position - secondOption.position,
    );

    const noValueViewTab = viewTabs.find(
      ({ type }) => type === ViewTabType.NO_VALUE,
    );

    const optionTabs = options.map((option, index) => {
      const fieldValueViewTab = viewTabs.find(
        ({ type, fieldValue }) =>
          type === ViewTabType.FIELD_VALUE && fieldValue === option.value,
      );

      return {
        id: option.value,
        kind: 'option' as const,
        label: option.label,
        color: option.color,
        viewTabId: fieldValueViewTab?.id,
        isVisible: fieldValueViewTab?.isVisible ?? true,
        position: fieldValueViewTab?.position ?? index,
        defaultPosition: index,
      };
    });

    return [
      ...optionTabs,
      {
        id: RECORD_INDEX_NO_VALUE_TAB_ID,
        kind: 'noValue' as const,
        label: '',
        viewTabId: noValueViewTab?.id,
        isVisible: noValueViewTab?.isVisible ?? true,
        position: noValueViewTab?.position ?? options.length,
        defaultPosition: options.length,
      },
      {
        id: RECORD_INDEX_ALL_TAB_ID,
        kind: 'all' as const,
        label: '',
        viewTabId: allViewTab?.id,
        isVisible: allViewTab?.isVisible ?? true,
        position: allViewTab?.position ?? options.length + 1,
        defaultPosition: options.length + 1,
      },
    ]
      .sort(sortByPosition)
      .map(removeOrder);
  }

  const customTabs = viewTabs
    .filter(({ type }) => type === ViewTabType.CUSTOM)
    .map((viewTab, index) => ({
      id: viewTab.id,
      kind: 'custom' as const,
      label: viewTab.name ?? '',
      viewTabId: viewTab.id,
      isVisible: viewTab.isVisible,
      position: viewTab.position,
      defaultPosition: index,
    }));

  if (customTabs.length === 0 && !isDefined(allViewTab)) {
    return [];
  }

  return [
    ...customTabs,
    {
      id: RECORD_INDEX_ALL_TAB_ID,
      kind: 'all' as const,
      label: '',
      viewTabId: allViewTab?.id,
      isVisible: allViewTab?.isVisible ?? true,
      position: allViewTab?.position ?? Number.MAX_SAFE_INTEGER,
      defaultPosition: customTabs.length,
    },
  ]
    .sort(sortByPosition)
    .map(removeOrder);
};
