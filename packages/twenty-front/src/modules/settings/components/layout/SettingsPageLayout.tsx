import { SettingsPageCommandMenu } from '@/command-menu-item/components/SettingsPageCommandMenu';
import { ContextStorePageTitleEffect } from '@/context-store/components/ContextStorePageTitleEffect';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { SettingsEditableTitle } from '@/settings/components/SettingsEditableTitle';
import { SettingsSecondaryBar } from '@/settings/components/layout/SettingsSecondaryBar';
import { SidePanelPageTitleSyncEffect } from '@/side-panel/components/SidePanelPageTitleSyncEffect';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/types/BreadcrumbProps';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, type JSX, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

type SettingsPageLayoutProps = {
  links: BreadcrumbProps['links'];
  title?: ReactNode;
  pageTitle?: string;
  icon?: ReactNode;
  pageCommands?: ReactNode;
  secondaryBar?: ReactNode;
  children: ReactNode;
  tag?: JSX.Element;
  titleColor?: string;
};

export const SettingsPageLayout = ({
  links,
  title,
  pageTitle,
  icon,
  pageCommands,
  secondaryBar,
  children,
  tag,
  titleColor,
}: SettingsPageLayoutProps) => {
  const titleInstanceId = useId();
  const isInMainSurface = useWorkspaceSurface().type === 'main';
  const isSettingsPage = useIsSettingsPage();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const resolvedPageTitle = [
    pageTitle,
    title,
    links.findLast(({ children }) => isNonEmptyString(children))?.children,
  ].find(isNonEmptyString);

  const formattedTitle =
    typeof title === 'string' ? (
      <SettingsEditableTitle
        disabled
        instanceId={`settings-page-layout-title-${titleInstanceId}`}
        textColor={titleColor}
        value={title}
      />
    ) : (
      title
    );

  return (
    <>
      <SidePanelPageTitleSyncEffect pageTitle={resolvedPageTitle} />
      {isSettingsPage && (
        <ContextStorePageTitleEffect pageTitle={resolvedPageTitle ?? null} />
      )}
      {pageCommands}
      <PageCardLayout
        header={
          <PageCardHeader
            links={links}
            title={formattedTitle}
            icon={icon}
            tag={tag}
            actionButton={
              isSettingsPage ? (
                <>
                  <SettingsPageCommandMenu />
                  {isInMainSurface && !isLayoutCustomizationModeEnabled && (
                    <SidePanelToggleButton />
                  )}
                </>
              ) : undefined
            }
            centerTitle
            titleColor={titleColor}
          />
        }
        secondaryBar={
          isDefined(secondaryBar) ? (
            <SettingsSecondaryBar>{secondaryBar}</SettingsSecondaryBar>
          ) : undefined
        }
      >
        {children}
      </PageCardLayout>
    </>
  );
};
