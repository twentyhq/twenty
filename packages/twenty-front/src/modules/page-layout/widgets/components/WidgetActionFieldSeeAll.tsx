import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';
import { useResolveFieldMetadataIdFromNameOrId } from '@/page-layout/hooks/useResolveFieldMetadataIdFromNameOrId';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { indexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/indexViewIdFromObjectMetadataItemFamilySelector';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath, ViewFilterOperand } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  IconArrowUpRight,
  TooltipDelay,
  TooltipPosition,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { RelationType } from '~/generated-metadata/graphql';

const StyledLinkContainer = styled.div`
  display: flex;

  > * {
    text-decoration: none;
  }
`;

const StyledSeeAllButtonWrapper = styled.div<{ isMobile: boolean }>`
  opacity: ${({ isMobile }) => (isMobile ? '1' : '0')};
  pointer-events: none;
  transition: opacity ${themeCssVariables.animation.duration.instant}s ease;

  .widget:hover & {
    opacity: 1;
    pointer-events: auto;
  }
`;

export const WidgetActionFieldSeeAll = () => {
  const widget = useCurrentWidget();
  const targetRecord = useTargetRecord();
  const isMobile = useIsMobile();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const fieldMetadataId = isFieldWidget(widget)
    ? widget.configuration.fieldMetadataId
    : undefined;

  const resolvedFieldMetadataId = useResolveFieldMetadataIdFromNameOrId(
    fieldMetadataId ?? '',
  );

  const { fieldMetadataItem } = useFieldMetadataItemById(
    resolvedFieldMetadataId ?? '',
  );

  const fieldDefinition = isDefined(fieldMetadataItem)
    ? formatFieldMetadataItemAsColumnDefinition({
        field: fieldMetadataItem,
        position: 0,
        objectMetadataItem,
        showLabel: true,
        labelWidth: 90,
      })
    : null;

  const relationMetadata =
    isDefined(fieldDefinition) && isFieldRelation(fieldDefinition)
      ? (fieldDefinition.metadata as FieldRelationMetadata)
      : null;

  const { objectMetadataItems } = useObjectMetadataItems();

  const isJunction = hasJunctionConfig(relationMetadata?.settings);

  const relationObjectMetadataItem = objectMetadataItems.find(
    (item) =>
      item.nameSingular ===
      relationMetadata?.relationObjectMetadataNameSingular,
  );

  const relationFieldMetadataItem = relationObjectMetadataItem?.fields.find(
    ({ id }) => id === relationMetadata?.relationFieldMetadataId,
  );

  const targetObjectMetadataItem = relationObjectMetadataItem;

  const indexViewId = useAtomFamilySelectorValue(
    indexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: targetObjectMetadataItem?.id ?? '' },
  );

  if (
    !isDefined(relationMetadata) ||
    relationMetadata.relationType !== RelationType.ONE_TO_MANY ||
    !isDefined(targetObjectMetadataItem) ||
    isJunction
  ) {
    return null;
  }

  if (!isDefined(relationFieldMetadataItem)) {
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
      objectNamePlural: targetObjectMetadataItem.namePlural,
    },
    filterQueryParams,
  );

  const tooltipId = `widget-see-all-${widget.id}`;
  const relationLabelPlural =
    targetObjectMetadataItem.labelPlural.toLowerCase();
  const tooltipContent = t`See all ${relationLabelPlural} linked to this record`;

  return (
    <>
      <div id={tooltipId}>
        <StyledLinkContainer>
          <Link to={filterLinkHref} data-testid="widget-see-all-link">
            <StyledSeeAllButtonWrapper isMobile={isMobile}>
              <LightIconButton Icon={IconArrowUpRight} accent="secondary" />
            </StyledSeeAllButtonWrapper>
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
