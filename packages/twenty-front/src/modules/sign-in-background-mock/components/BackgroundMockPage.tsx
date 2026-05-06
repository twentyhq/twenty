import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  IconBuildingSkyscraper,
  IconDotsVertical,
  IconLayoutSidebarRight,
  IconPlus,
  TintedIconTile,
} from 'twenty-ui/display';
import { Button, LightIconButton } from 'twenty-ui/input';

import { BackgroundMockTable } from '@/sign-in-background-mock/components/BackgroundMockTable';
import { BackgroundMockViewBar } from '@/sign-in-background-mock/components/BackgroundMockViewBar';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

const StyledTableContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

export const BackgroundMockPage = () => {
  return (
    <PageContainer>
      <PageHeader
        title={t`Companies`}
        Icon={() => (
          <TintedIconTile Icon={IconBuildingSkyscraper} color="blue" />
        )}
      >
        <Button
          Icon={IconPlus}
          title={t`New Company`}
          variant="primary"
          accent="default"
          size="small"
        />
        <LightIconButton
          Icon={IconDotsVertical}
          accent="tertiary"
          size="small"
        />
        <Button
          Icon={IconLayoutSidebarRight}
          variant="secondary"
          accent="default"
          size="small"
        />
      </PageHeader>
      <PageBody>
        <StyledTableContainer>
          <BackgroundMockViewBar />
          <BackgroundMockTable />
        </StyledTableContainer>
      </PageBody>
    </PageContainer>
  );
};
