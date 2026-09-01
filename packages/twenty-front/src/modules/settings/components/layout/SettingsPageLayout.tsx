import { SettingsEditableTitle } from '@/settings/components/SettingsEditableTitle';
import { SettingsSecondaryBar } from '@/settings/components/layout/SettingsSecondaryBar';
import { useUpdateSidePanelPageInfo } from '@/side-panel/hooks/useUpdateSidePanelPageInfo';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useEffect, useId, type JSX, type ReactNode } from 'react';
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
  const workspaceSurface = useWorkspaceSurface();
  const { updateSidePanelPageInfo } = useUpdateSidePanelPageInfo();

  const pageTitle =
    typeof title === 'string'
      ? title
      : links.findLast(({ children }) => typeof children === 'string')
          ?.children;

  useEffect(() => {
    if (
      workspaceSurface.type === 'side-panel' &&
      typeof pageTitle === 'string'
    ) {
      updateSidePanelPageInfo({ pageTitle });
    }
  }, [pageTitle, updateSidePanelPageInfo, workspaceSurface.type]);

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
  );
};
