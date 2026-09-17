import styled from '@emotion/styled';
import { Fragment } from 'react';
import { t } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { Separator } from 'src/front-components/components/Separator';
import { StyledSettingsCardTextContainer } from 'src/front-components/components/SettingsCardContentBase';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { StyledSkeletonBlock } from 'src/front-components/components/StyledSkeletonBlock';
import { StyledSkeletonTextLines } from 'src/front-components/components/StyledSkeletonTextLines';

const POLICY_OPTION_DESCRIPTION_WIDTHS_PIXELS = [220, 280];

const StyledOptionRow = styled.div`
  align-items: center;
  background-color: ${() => themeCssVariables.background.secondary};
  display: flex;
  gap: ${() => themeCssVariables.spacing[4]};
  padding: ${() => themeCssVariables.spacing[4]};
`;

export const GranolaFolderPolicySkeleton = () => (
  <StyledSettingsCard role="status" aria-label={t('Loading')}>
    {POLICY_OPTION_DESCRIPTION_WIDTHS_PIXELS.map(
      (descriptionWidthPixels, index) => (
        <Fragment key={descriptionWidthPixels}>
          {index > 0 && <Separator />}
          <StyledOptionRow>
            <StyledSkeletonBlock $width={32} $height={40} />
            <StyledSettingsCardTextContainer>
              <StyledSkeletonTextLines>
                <StyledSkeletonBlock $width={96} $height={13} />
                <StyledSkeletonBlock
                  $width={descriptionWidthPixels}
                  $height={13}
                />
              </StyledSkeletonTextLines>
            </StyledSettingsCardTextContainer>
            <StyledSkeletonBlock $width={16} $height={16} $isCircle />
          </StyledOptionRow>
        </Fragment>
      ),
    )}
  </StyledSettingsCard>
);
