import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useFieldWidgetFieldDefinition } from '@/page-layout/widgets/field/hooks/useFieldWidgetFieldDefinition';
import { useFieldWidgetRelationSeeAllHref } from '@/page-layout/widgets/field/hooks/useFieldWidgetRelationSeeAllHref';
import { WidgetCardHeaderActionLink } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionLink';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight } from 'twenty-ui/icon';

type WidgetActionFieldSeeAllProps = {
  widget: PageLayoutWidget;
};

export const WidgetActionFieldSeeAll = ({
  widget,
}: WidgetActionFieldSeeAllProps) => {
  const targetRecord = useTargetRecord();

  const { fieldDefinition } = useFieldWidgetFieldDefinition(widget);

  const { seeAllHref, relationObjectMetadataItem } =
    useFieldWidgetRelationSeeAllHref({
      recordId: targetRecord.id,
      relationMetadata:
        isDefined(fieldDefinition) && isFieldRelation(fieldDefinition)
          ? fieldDefinition.metadata
          : null,
    });

  if (!isDefined(seeAllHref) || !isDefined(relationObjectMetadataItem)) {
    return null;
  }

  const relationLabelPlural =
    relationObjectMetadataItem.labelPlural.toLowerCase();
  const actionLabel = t`See all ${relationLabelPlural} linked to this record`;

  return (
    <WidgetCardHeaderActionLink
      Icon={IconArrowUpRight}
      label={actionLabel}
      to={seeAllHref}
    />
  );
};
