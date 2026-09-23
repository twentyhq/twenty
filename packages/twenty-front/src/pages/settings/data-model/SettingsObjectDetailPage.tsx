import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ObjectFields } from '@/settings/data-model/object-details/components/tabs/ObjectFields';
import { ObjectLayout } from '@/settings/data-model/object-details/components/tabs/ObjectLayout';
import { ObjectSettings } from '@/settings/data-model/object-details/components/tabs/ObjectSettings';
import { ObjectValidationRules } from '@/settings/data-model/object-details/components/tabs/ObjectValidationRules';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import {
  AppPath,
  CoreObjectNameSingular,
  SettingsPath,
} from 'twenty-shared/types';

import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { getAppPath, getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconArrowUpRight,
  IconAppWindow,
  IconListCheck,
  IconListDetails,
  IconPlus,
  IconSettings,
} from 'twenty-ui/icon';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { SETTINGS_OBJECT_DETAIL_TABS } from '~/pages/settings/data-model/constants/SettingsObjectDetailTabs';
import { updatedObjectNamePluralState } from '~/pages/settings/data-model/states/updatedObjectNamePluralState';

const StyledContentContainer = styled.div`
  flex: 1;
  padding-left: 0;
  width: 100%;
`;

export const SettingsObjectDetailPage = () => {
  const navigateApp = useNavigateApp();
  const workspaceSurface = useWorkspaceSurface();
  const { t } = useLingui();
  const { objectNamePlural = '' } = useParams();

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const [updatedObjectNamePlural, setUpdatedObjectNamePlural] = useAtomState(
    updatedObjectNamePluralState,
  );
  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural) ??
    findObjectMetadataItemByNamePlural(updatedObjectNamePlural);

  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const readonly =
    isObjectMetadataReadOnly({
      objectMetadataItem,
    }) || isDDLLocked;

  const tabsComponentInstanceId = useWorkspaceSurfaceScopedComponentInstanceId(
    SETTINGS_OBJECT_DETAIL_TABS.COMPONENT_INSTANCE_ID,
  );

  const activeTabId =
    useAtomComponentStateValue(
      activeTabIdComponentState,
      tabsComponentInstanceId,
    ) ?? SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.FIELDS;

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (objectNamePlural === updatedObjectNamePlural)
      setUpdatedObjectNamePlural('');
    if (
      workspaceSurface.type === 'main' &&
      !isDeleting &&
      !isDefined(objectMetadataItem)
    )
      navigateApp(AppPath.NotFound);
  }, [
    objectMetadataItem,
    navigateApp,
    objectNamePlural,
    updatedObjectNamePlural,
    setUpdatedObjectNamePlural,
    isDeleting,
    workspaceSurface.type,
  ]);

  if (!isDefined(objectMetadataItem)) {
    return workspaceSurface.type === 'side-panel' ? (
      <WorkspaceRouteUnavailable />
    ) : null;
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
      id: SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.LAYOUT,
      title: t`Layout`,
      Icon: IconAppWindow,
      hide:
        objectMetadataItem.isRemote ||
        objectMetadataItem.nameSingular === CoreObjectNameSingular.Dashboard,
    },
    {
      id: SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.VALIDATION_RULES,
      title: t`Validation`,
      Icon: IconListCheck,
      hide: objectMetadataItem.isRemote,
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
      case SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.LAYOUT:
        return <ObjectLayout objectMetadataItem={objectMetadataItem} />;
      case SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.VALIDATION_RULES:
        return (
          <ObjectValidationRules objectMetadataItem={objectMetadataItem} />
        );
      default:
        return <></>;
    }
  };

  return (
    <SettingsPageLayout
      title={objectMetadataItem.labelPlural}
      icon={<ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
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
        <>
          <NavigationButton
            startIcon={<IconArrowUpRight />}
            size="sm"
            to={getAppPath(AppPath.RecordIndexPage, {
              objectNamePlural: objectMetadataItem.namePlural,
            })}
            variant="ghost"
          >{t`See records`}</NavigationButton>
          {!readonly &&
            activeTabId === SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.FIELDS && (
              <NavigationButton
                to="./new-field/select"
                size="sm"
                startIcon={<IconPlus />}
                variant="solid"
                color="accent"
              >{t`New Field`}</NavigationButton>
            )}
        </>
      }
      secondaryBar={
        <SettingsTabBar
          aria-label={t`Object settings`}
          tabs={tabs}
          componentInstanceId={tabsComponentInstanceId}
        />
      }
    >
      <SettingsPageContainer>
        <StyledContentContainer>
          {renderActiveTabContent()}
        </StyledContentContainer>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
