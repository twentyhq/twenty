import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { useSettingsPermissionMap } from '@/settings/roles/hooks/useSettingsPermissionMap';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { Children, ReactNode, isValidElement } from 'react';
import { isDefined } from 'twenty-shared';
import { FeatureFlagKey } from '~/generated/graphql';
import {
  SettingsNavigationItemWrapper,
  SettingsNavigationItemWrapperProps,
} from './SettingsNavigationItemWrapper';

type SettingsNavigationSectionWrapperProps = {
  title: string;
  children: ReactNode;
  isAdvanced?: boolean;
};

export const SettingsNavigationSectionWrapper = ({
  title,
  children,
  isAdvanced = false,
}: SettingsNavigationSectionWrapperProps) => {
  const settingsPermissionMap = useSettingsPermissionMap();
  const featureFlagsMap = useFeatureFlagsMap();

  const hasPermissionEnabled =
    featureFlagsMap[FeatureFlagKey.IsPermissionsEnabled];

  const hasVisibleChildren = (children: ReactNode): boolean => {
    return Children.toArray(children).some((child) => {
      if (!isValidElement(child)) {
        return false;
      }

      if (child.type === SettingsNavigationItemWrapper) {
        const { requiredFeatureFlag, settingsPermission } =
          child.props as SettingsNavigationItemWrapperProps;

        if (
          isDefined(requiredFeatureFlag) &&
          !featureFlagsMap[requiredFeatureFlag]
        ) {
          return false;
        }

        if (!hasPermissionEnabled) {
          return true;
        }

        if (isDefined(settingsPermission)) {
          return settingsPermissionMap[settingsPermission];
        }

        return true;
      }

      if (isDefined(child.props?.children)) {
        return hasVisibleChildren(child.props.children);
      }

      return true;
    });
  };

  if (!hasVisibleChildren(children)) {
    return null;
  }

  return (
    <NavigationDrawerSection>
      {isAdvanced ? (
        <AdvancedSettingsWrapper hideIcon={true}>
          <NavigationDrawerSectionTitle label={title} />
        </AdvancedSettingsWrapper>
      ) : (
        <NavigationDrawerSectionTitle label={title} />
      )}

      {children}
    </NavigationDrawerSection>
  );
};
