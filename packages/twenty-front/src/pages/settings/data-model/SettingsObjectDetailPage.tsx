import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ObjectFields } from '@/settings/data-model/object-details/components/tabs/ObjectFields';
import { ObjectIndexes } from '@/settings/data-model/object-details/components/tabs/ObjectIndexes';
import { ObjectSettings } from '@/settings/data-model/object-details/components/tabs/ObjectSettings';
import { SettingsDataModelObjectTypeTag } from '@/settings/data-model/objects/components/SettingsDataModelObjectTypeTag';
import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  Button,
  H3Title,
  IconCodeCircle,
  IconListDetails,
  IconPlus,
  IconSettings,
  IconTool,
  isDefined,
  MAIN_COLORS,
  UndecoratedLink,
} from 'twenty-ui';
import { updatedObjectSlugState } from '~/pages/settings/data-model/states/updatedObjectSlugState';

const StyledTabListContainer = styled.div`
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(10)};
  .tab-list {
    padding-left: 0px;
  }
  .tab-list > div {
    padding: ${({ theme }) => theme.spacing(3) + ' 0'};
  }
`;

const StyledContentContainer = styled.div`
  flex: 1;
  width: 100%;
  padding-left: 0;
`;

const StyledObjectTypeTag = styled(SettingsDataModelObjectTypeTag)`
  box-sizing: border-box;
  height: ${({ theme }) => theme.spacing(5)};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitleContainer = styled.div`
  display: flex;
`;

const TAB_LIST_COMPONENT_ID = 'object-details-tab-list';
const FIELDS_TAB_ID = 'fields';
const SETTINGS_TAB_ID = 'settings';
const INDEXES_TAB_ID = 'indexes';

export const SettingsObjectDetailPage = () => {
  const navigate = useNavigate();

  const { objectSlug = '' } = useParams();
  const { findActiveObjectMetadataItemBySlug } =
    useFilteredObjectMetadataItems();

  const [updatedObjectSlug, setUpdatedObjectSlug] = useRecoilState(
    updatedObjectSlugState,
  );
  const objectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug) ??
    findActiveObjectMetadataItemBySlug(updatedObjectSlug);

  const { activeTabIdState } = useTabList(TAB_LIST_COMPONENT_ID);
  const activeTabId = useRecoilValue(activeTabIdState);

  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);
  const isUniqueIndexesEnabled = useIsFeatureEnabled(
    'IS_UNIQUE_INDEXES_ENABLED',
  );

  useEffect(() => {
    if (objectSlug === updatedObjectSlug) setUpdatedObjectSlug('');
    if (!isDefined(objectMetadataItem)) navigate(AppPath.NotFound);
  }, [
    objectMetadataItem,
    navigate,
    objectSlug,
    updatedObjectSlug,
    setUpdatedObjectSlug,
  ]);

  if (!isDefined(objectMetadataItem)) return <></>;

  const tabs = [
    {
      id: FIELDS_TAB_ID,
      title: 'Fields',
      Icon: IconListDetails,
      hide: false,
    },
    {
      id: SETTINGS_TAB_ID,
      title: 'Settings',
      Icon: IconSettings,
      hide: false,
    },
    {
      id: INDEXES_TAB_ID,
      title: 'Indexes',
      Icon: IconCodeCircle,
      hide: !isAdvancedModeEnabled || !isUniqueIndexesEnabled,
      pill: <IconTool size={12} color={MAIN_COLORS.yellow} />,
    },
  ];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case FIELDS_TAB_ID:
        return <ObjectFields objectMetadataItem={objectMetadataItem} />;
      case SETTINGS_TAB_ID:
        return <ObjectSettings objectMetadataItem={objectMetadataItem} />;
      case INDEXES_TAB_ID:
        return <ObjectIndexes objectMetadataItem={objectMetadataItem} />;
      default:
        return <></>;
    }
  };

  const objectTypeLabel = getObjectTypeLabel(objectMetadataItem);

  return (
    <SubMenuTopBarContainer
      title={
        <StyledTitleContainer>
          <H3Title title={objectMetadataItem.labelPlural} />
          <StyledObjectTypeTag objectTypeLabel={objectTypeLabel} />
        </StyledTitleContainer>
      }
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Objects', href: '/settings/objects' },
        {
          children: objectMetadataItem.labelPlural,
        },
      ]}
      actionButton={
        activeTabId === FIELDS_TAB_ID && (
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
      <SettingsPageContainer>
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
