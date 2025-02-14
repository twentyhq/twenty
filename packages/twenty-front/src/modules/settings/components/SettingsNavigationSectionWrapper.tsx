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
};

export const SettingsNavigationSectionWrapper = ({
  title,
  children,
}: SettingsNavigationSectionWrapperProps) => {
  const settingsPermissionMap = useSettingsPermissionMap();
  const featureFlagsMap = useFeatureFlagsMap();

  const hasVisibleChildren = (children: ReactNode): boolean => {
    return Children.toArray(children).some((child) => {
      if (!isValidElement(child)) {
        return false;
      }

      if (child.type === SettingsNavigationItemWrapper) {
        const { requiredFeatureFlag, feature } =
          child.props as SettingsNavigationItemWrapperProps;

        const hasPermissionEnabled =
          featureFlagsMap[FeatureFlagKey.IsPermissionsEnabled];
        const requiredFeatureFlagEnabled =
          requiredFeatureFlag && featureFlagsMap[requiredFeatureFlag];

        if (!hasPermissionEnabled) {
          return true;
        }

        if (!requiredFeatureFlagEnabled) {
          return false;
        }

        if (isDefined(feature)) {
          return settingsPermissionMap[feature];
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
      <NavigationDrawerSectionTitle label={title} />
      {children}
    </NavigationDrawerSection>
  );
};
