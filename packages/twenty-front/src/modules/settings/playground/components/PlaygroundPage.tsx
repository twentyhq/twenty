import { SettingsPath } from '@/types/SettingsPath';
import {
  PAGE_BAR_MIN_HEIGHT,
  PageHeader,
} from '@/ui/layout/page/components/PageHeader';
import {
  Breadcrumb,
  BreadcrumbProps,
} from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import '@scalar/api-reference-react/style.css';
import { Button, IconX, useIsMobile } from 'twenty-ui';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type PlaygroundPageProps = {
  children: JSX.Element | JSX.Element[];
  links: BreadcrumbProps['links'];
};

const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  width: 100dvw;
  height: 100dvh;
  background: ${({ theme }) => theme.background.noisy};
`;

const StyledMainContainer = styled.div<{ pageBarHeight: number }>`
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  height: calc(100vh - ${({ pageBarHeight }) => `${pageBarHeight}px`});
  width: 100vw;
`;

export const PlaygroundPage = ({ children, links }: PlaygroundPageProps) => {
  const isMobile = useIsMobile();
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

  const closePlayground = () => {
    navigateSettings(SettingsPath.APIs);
  };

  return (
    <StyledPage>
      <PageHeader title={<Breadcrumb links={links} />}>
        <Button
          Icon={IconX}
          dataTestId="close-button"
          size={isMobile ? 'medium' : 'small'}
          variant="secondary"
          accent="default"
          onClick={closePlayground}
          ariaLabel={t`Close playground`}
        />
      </PageHeader>
      <StyledMainContainer pageBarHeight={PAGE_BAR_MIN_HEIGHT}>
        {children}
      </StyledMainContainer>
    </StyledPage>
  );
};
