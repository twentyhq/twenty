import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { LightIconButton, TintedIconTile } from 'twenty-ui/components';
import {
  IconBuildingSkyscraper,
  IconDotsVertical,
  IconLayoutSidebarRight,
  IconPlus,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

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
                startIcon={<IconPlus />}
                size="sm"
                variant="solid"
                color="accent"
              >{t`New Company`}</Button>
              <LightIconButton
                Icon={IconDotsVertical}
                accent="tertiary"
                size="small"
              />
              <Button
                startIcon={<IconLayoutSidebarRight />}
                aria-label={t`Open side panel`}
                size="sm"
                variant="outline"
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
