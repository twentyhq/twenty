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
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';

const StyledTableContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  width: 100%;
`;

export const BackgroundMockPage = () => {
  return (
    <PageCardLayout
      header={
        <PageCardHeader
          icon={<TintedIconTile Icon={IconBuildingSkyscraper} color="blue" />}
          title={t`Companies`}
          actionButton={
            <>
              <Button
                Icon={IconPlus}
                title={t`New Company`}
                variant="primary"
                accent="blue"
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
            </>
          }
        />
      }
      secondaryBar={<BackgroundMockViewBar />}
      showInformationBanner={false}
    >
      <StyledTableContainer>
        <BackgroundMockTable />
      </StyledTableContainer>
    </PageCardLayout>
  );
};
