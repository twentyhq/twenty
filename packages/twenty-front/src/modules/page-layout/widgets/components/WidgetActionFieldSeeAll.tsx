import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useFieldWidgetFieldDefinition } from '@/page-layout/widgets/field/hooks/useFieldWidgetFieldDefinition';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { indexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/indexViewIdFromObjectMetadataItemFamilySelector';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath, ViewFilterOperand } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { AppTooltip, TooltipDelay, TooltipPosition } from 'twenty-ui/surfaces';

const StyledLinkContainer = styled.div`
  display: flex;

  > * {
    text-decoration: none;
  }
`;

type WidgetActionFieldSeeAllProps = {
  widget: PageLayoutWidget;
};

export const WidgetActionFieldSeeAll = ({
  widget,
}: WidgetActionFieldSeeAllProps) => {
  const targetRecord = useTargetRecord();

  const { fieldDefinition } = useFieldWidgetFieldDefinition(widget);

  const relationMetadata =
    isDefined(fieldDefinition) && isFieldRelation(fieldDefinition)
      ? fieldDefinition.metadata
      : null;

  const { objectMetadataItems } = useObjectMetadataItems();

  const relationObjectMetadataItem = objectMetadataItems.find(
    (item) =>
      item.nameSingular ===
      relationMetadata?.relationObjectMetadataNameSingular,
  );

  const relationFieldMetadataItem = relationObjectMetadataItem?.fields.find(
    ({ id }) => id === relationMetadata?.relationFieldMetadataId,
  );

  const indexViewId = useAtomFamilySelectorValue(
    indexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: relationObjectMetadataItem?.id ?? '' },
  );

  if (
    !isDefined(relationObjectMetadataItem) ||
    !isDefined(relationFieldMetadataItem)
  ) {
    return null;
  }

  const filterQueryParams = {
    filter: {
      [relationFieldMetadataItem.name]: {
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
      objectNamePlural: relationObjectMetadataItem.namePlural,
    },
    filterQueryParams,
  );

  const tooltipId = `widget-see-all-${widget.id}`;
  const relationLabelPlural =
    relationObjectMetadataItem.labelPlural.toLowerCase();
  const tooltipContent = t`See all ${relationLabelPlural} linked to this record`;

  return (
    <>
      <div id={tooltipId}>
        <StyledLinkContainer>
          <Link to={filterLinkHref} data-testid="widget-see-all-link">
            <LightIconButton Icon={IconArrowUpRight} accent="secondary" />
          </Link>
        </StyledLinkContainer>
      </div>
      <AppTooltip
        anchorSelect={`#${tooltipId}`}
        content={tooltipContent}
        place={TooltipPosition.Top}
        delay={TooltipDelay.mediumDelay}
        offset={5}
        noArrow
      />
    </>
  );
};
