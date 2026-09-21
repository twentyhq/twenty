import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useFieldWidgetFieldDefinition } from '@/page-layout/widgets/field/hooks/useFieldWidgetFieldDefinition';
import { getFieldWidgetRelationTraversal } from '@/page-layout/widgets/field/utils/getFieldWidgetRelationTraversal';
import { WidgetCardHeaderActionLink } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionLink';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { indexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/indexViewIdFromObjectMetadataItemFamilySelector';
import { t } from '@lingui/core/macro';
import { AppPath, ViewFilterOperand } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight } from 'twenty-ui/icon';

type WidgetActionFieldSeeAllProps = {
  widget: PageLayoutWidget;
};

export const WidgetActionFieldSeeAll = ({
  widget,
}: WidgetActionFieldSeeAllProps) => {
  const targetRecord = useTargetRecord();

  const { fieldDefinition } = useFieldWidgetFieldDefinition(widget);

  const { objectMetadataItems } = useObjectMetadataItems();

  const sourceFieldMetadataItem = objectMetadataItems
    .flatMap(({ fields }) => fields)
    .find(({ id }) => id === fieldDefinition?.fieldMetadataId);

  const {
    targetObjectMetadataId,
    inverseFieldMetadataId,
    relationTargetFieldMetadataId,
  } = getFieldWidgetRelationTraversal({
    sourceFieldMetadataItem,
    objectMetadataItems,
  });

  const listedObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === targetObjectMetadataId,
  );

  const listedFieldMetadataItem = listedObjectMetadataItem?.fields.find(
    ({ id }) => id === inverseFieldMetadataId,
  );

  const relationTargetFieldMetadataItem = isDefined(
    relationTargetFieldMetadataId,
  )
    ? objectMetadataItems
        .flatMap(({ fields }) => fields)
        .find(({ id }) => id === relationTargetFieldMetadataId)
    : undefined;

  const indexViewId = useAtomFamilySelectorValue(
    indexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: listedObjectMetadataItem?.id ?? '' },
  );

  if (
    !isDefined(listedObjectMetadataItem) ||
    !isDefined(listedFieldMetadataItem)
  ) {
    return null;
  }

  const filterKey = isDefined(relationTargetFieldMetadataItem)
    ? `${listedFieldMetadataItem.name}.${relationTargetFieldMetadataItem.name}`
    : listedFieldMetadataItem.name;

  const filterQueryParams = {
    filter: {
      [filterKey]: {
        [ViewFilterOperand.IS]: {
          selectedRecordIds: [targetRecord.id],
        },
      },
    },
    viewId: indexViewId,
  };

  const filterLinkHref = getAppPath(
    AppPath.RecordIndexPage,
    {
      objectNamePlural: listedObjectMetadataItem.namePlural,
    },
    filterQueryParams,
  );

  const relationLabelPlural =
    listedObjectMetadataItem.labelPlural.toLowerCase();
  const actionLabel = t`See all ${relationLabelPlural} linked to this record`;

  return (
    <WidgetCardHeaderActionLink
      Icon={IconArrowUpRight}
      label={actionLabel}
      to={filterLinkHref}
    />
  );
};
