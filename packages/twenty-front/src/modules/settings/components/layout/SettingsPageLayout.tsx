import { SettingsEditableTitle } from '@/settings/components/SettingsEditableTitle';
import { SettingsSecondaryBar } from '@/settings/components/layout/SettingsSecondaryBar';
import { SidePanelPageTitleSyncEffect } from '@/side-panel/components/SidePanelPageTitleSyncEffect';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useId, type JSX, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

type SettingsPageLayoutProps = {
  links: BreadcrumbProps['links'];
  title?: ReactNode;
  icon?: ReactNode;
  actionButton?: ReactNode;
  secondaryBar?: ReactNode;
  children: ReactNode;
  tag?: JSX.Element;
  titleColor?: string;
};

export const SettingsPageLayout = ({
  links,
  title,
  icon,
  actionButton,
  secondaryBar,
  children,
  tag,
  titleColor,
}: SettingsPageLayoutProps) => {
  const titleInstanceId = useId();

  const pageTitle =
    typeof title === 'string'
      ? title
      : links.findLast(({ children }) => typeof children === 'string')
          ?.children;

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
      <SidePanelPageTitleSyncEffect
        pageTitle={typeof pageTitle === 'string' ? pageTitle : undefined}
      />
      <PageCardLayout
        header={
          <PageCardHeader
            links={links}
            title={formattedTitle}
            icon={icon}
            tag={tag}
            actionButton={actionButton}
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
