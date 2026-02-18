import { RecordIndexActionMenu } from '@/action-menu/components/RecordIndexActionMenu';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { PageHeaderToggleCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderToggleCommandMenuButton';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

const StyledTitleWithSelectedRecords = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  padding-right: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledSelectedRecordsCount = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding-left: ${({ theme }) => theme.spacing(0.5)};
`;

export const RecordIndexPageHeader = () => {
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const contextStoreNumberOfSelectedRecords = useRecoilComponentValue(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const { objectNamePlural } = useRecordIndexContextOrThrow();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const { getIcon } = useIcons();
  const ObjectIcon = getIcon(objectMetadataItem?.icon);
  const iconColor = objectMetadataItem
    ? getStandardObjectIconColor(objectMetadataItem.nameSingular)
    : undefined;

  const PageHeaderIcon = ObjectIcon
    ? () => (
        <NavigationMenuItemStyleIcon
          Icon={ObjectIcon}
          color={iconColor ?? undefined}
        />
      )
    : undefined;

  const label = objectMetadataItem?.labelPlural ?? objectNamePlural;

  const pageHeaderTitle =
    contextStoreNumberOfSelectedRecords > 0 ? (
      <StyledTitleWithSelectedRecords>
        <StyledTitle>{label}</StyledTitle>
        <>{'->'}</>
        <StyledSelectedRecordsCount>
          {t`${contextStoreNumberOfSelectedRecords} selected`}
        </StyledSelectedRecordsCount>
      </StyledTitleWithSelectedRecords>
    ) : (
      label
    );

  const contextStoreCurrentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  return (
    <PageHeader title={pageHeaderTitle} Icon={PageHeaderIcon}>
      {isDefined(contextStoreCurrentViewId) && (
        <>
          <RecordIndexActionMenu />
          <PageHeaderToggleCommandMenuButton />
        </>
      )}
    </PageHeader>
  );
};
