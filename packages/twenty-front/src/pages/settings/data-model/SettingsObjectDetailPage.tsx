import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ObjectFields } from '@/settings/data-model/object-details/components/tabs/ObjectFields';
import { ObjectIndexes } from '@/settings/data-model/object-details/components/tabs/ObjectIndexes';
import { ObjectSettings } from '@/settings/data-model/object-details/components/tabs/ObjectSettings';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import { AppPath, SettingsPath } from 'twenty-shared/types';

import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconCodeCircle,
  IconListDetails,
  IconPlus,
  IconPoint,
  IconSettings,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { FeatureFlagKey } from '~/generated/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { SETTINGS_OBJECT_DETAIL_TABS } from '~/pages/settings/data-model/constants/SettingsObjectDetailTabs';
import { updatedObjectNamePluralState } from '~/pages/settings/data-model/states/updatedObjectNamePluralState';

const StyledContentContainer = styled.div`
  flex: 1;
  width: 100%;
  padding-left: 0;
`;

export const SettingsObjectDetailPage = () => {
  const navigateApp = useNavigateApp();
  const { t } = useLingui();
  const theme = useTheme();

  const { objectNamePlural = '' } = useParams();

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const [updatedObjectNamePlural, setUpdatedObjectNamePlural] = useRecoilState(
    updatedObjectNamePluralState,
  );
  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural) ??
    findObjectMetadataItemByNamePlural(updatedObjectNamePlural);

  const readonly = isObjectMetadataReadOnly({
    objectMetadataItem,
  });

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    SETTINGS_OBJECT_DETAIL_TABS.COMPONENT_INSTANCE_ID,
  );

  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);
  const isUniqueIndexesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_UNIQUE_INDEXES_ENABLED,
  );

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (objectNamePlural === updatedObjectNamePlural)
      setUpdatedObjectNamePlural('');
    if (!isDeleting && !isDefined(objectMetadataItem))
      navigateApp(AppPath.NotFound);
  }, [
    objectMetadataItem,
    navigateApp,
    objectNamePlural,
    updatedObjectNamePlural,
    setUpdatedObjectNamePlural,
    isDeleting,
  ]);

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  const tabs = [
    {
      id: SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.FIELDS,
      title: t`Fields`,
      Icon: IconListDetails,
      hide: false,
    },
    {
      id: SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.SETTINGS,
      title: t`Settings`,
      Icon: IconSettings,
      hide: false,
    },
    {
      id: SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.INDEXES,
      title: t`Indexes`,
      Icon: IconCodeCircle,
      hide: !isAdvancedModeEnabled || !isUniqueIndexesEnabled,
      pill: (
        <IconPoint
          size={12}
          color={theme.color.yellow}
          fill={theme.color.yellow}
        />
      ),
    },
  ];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.FIELDS:
        return <ObjectFields objectMetadataItem={objectMetadataItem} />;
      case SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.SETTINGS:
        return (
          <ObjectSettings
            objectMetadataItem={objectMetadataItem}
            isDeleting={isDeleting}
            setIsDeleting={setIsDeleting}
          />
        );
      case SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.INDEXES:
        return <ObjectIndexes objectMetadataItem={objectMetadataItem} />;
      default:
        return <></>;
    }
  };

  return (
    <>
      <SubMenuTopBarContainer
        title={objectMetadataItem.labelPlural}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`Objects`,
            href: getSettingsPath(SettingsPath.Objects),
          },
          {
            children: objectMetadataItem.labelPlural,
          },
        ]}
        actionButton={
          !readonly &&
          activeTabId === SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.FIELDS && (
            <UndecoratedLink to="./new-field/select">
              <Button
                title={t`New Field`}
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
          <TabList
            tabs={tabs}
            componentInstanceId={
              SETTINGS_OBJECT_DETAIL_TABS.COMPONENT_INSTANCE_ID
            }
          />
          <StyledContentContainer>
            {renderActiveTabContent()}
          </StyledContentContainer>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </>
  );
};
