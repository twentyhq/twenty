import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ObjectFields } from '@/settings/data-model/object-details/components/tabs/ObjectFields';
import { ObjectIndexes } from '@/settings/data-model/object-details/components/tabs/ObjectIndexes';
import { ObjectSettings } from '@/settings/data-model/object-details/components/tabs/ObjectSettings';
import { SettingsDataModelObjectTypeTag } from '@/settings/data-model/objects/components/SettingsDataModelObjectTypeTag';
import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import {
  H3Title,
  IconCodeCircle,
  IconListDetails,
  IconPlus,
  IconSettings,
  IconTool,
  MAIN_COLORS,
  UndecoratedLink,
} from 'twenty-ui';

const StyledTabListContainer = styled.div`
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(10)};
  padding-left: ${({ theme }) => theme.spacing(8)};
  .tab-list {
    padding-left: 0px;
  }
  .tab-list > div {
    padding: ${({ theme }) => theme.spacing(3) + ' 0'};
  }
`;

const StyledContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const StyledObjectTypeTag = styled(SettingsDataModelObjectTypeTag)`
  box-sizing: border-box;
  height: ${({ theme }) => theme.spacing(5)};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitleContainer = styled.div`
  display: flex;
  padding-left: ${({ theme }) => theme.spacing(8)};
`;

export type SettingsObjectDetailPageContentProps = {
  objectMetadataItem: ObjectMetadataItem;
};

const TAB_LIST_COMPONENT_ID = 'object-details-tab-list';

export const SettingsObjectDetailPageContent = ({
  objectMetadataItem,
}: SettingsObjectDetailPageContentProps) => {
  const { activeTabIdState } = useTabList(TAB_LIST_COMPONENT_ID);
  const activeTabId = useRecoilValue(activeTabIdState);

  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);
  const isUniqueIndexesEnabled = useIsFeatureEnabled(
    'IS_UNIQUE_INDEXES_ENABLED',
  );

  const tabs = [
    {
      id: 'fields',
      title: 'Fields',
      Icon: IconListDetails,
      hide: false,
    },
    {
      id: 'settings',
      title: 'Settings',
      Icon: IconSettings,
      hide: false,
    },
    {
      id: 'indexes',
      title: 'Indexes',
      Icon: IconCodeCircle,
      hide: !isAdvancedModeEnabled || !isUniqueIndexesEnabled,
      pill: <IconTool size={12} color={MAIN_COLORS.yellow} />,
    },
  ];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case 'fields':
        return <ObjectFields objectMetadataItem={objectMetadataItem} />;
      case 'settings':
        return <ObjectSettings objectMetadataItem={objectMetadataItem} />;
      case 'indexes':
        return <ObjectIndexes objectMetadataItem={objectMetadataItem} />;
      default:
        return <></>;
    }
  };

  const objectTypeLabel = getObjectTypeLabel(objectMetadataItem);

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Objects', href: '/settings/objects' },
        { children: objectMetadataItem.labelPlural },
      ]}
      actionButton={
        activeTabId === 'fields' && (
          <UndecoratedLink to={'./new-field/select'}>
            <Button
              title="New Field"
              variant="primary"
              size="small"
              accent="blue"
              Icon={IconPlus}
            />
          </UndecoratedLink>
        )
      }
    >
      <SettingsPageContainer removeLeftPadding>
        <StyledTitleContainer>
          <H3Title title={objectMetadataItem.labelPlural} />
          <StyledObjectTypeTag objectTypeLabel={objectTypeLabel} />
        </StyledTitleContainer>
        <StyledTabListContainer>
          <TabList
            tabListId={TAB_LIST_COMPONENT_ID}
            tabs={tabs}
            className="tab-list"
          />
        </StyledTabListContainer>
        <StyledContentContainer>
          {renderActiveTabContent()}
        </StyledContentContainer>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
