import { t } from 'twenty-sdk/front-component';

import {
  StyledSettingsCardContent,
  StyledSettingsCardTextContainer,
} from 'src/front-components/components/SettingsCardContentBase';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { StyledSkeletonBlock } from 'src/front-components/components/StyledSkeletonBlock';
import { StyledSkeletonTextLines } from 'src/front-components/components/StyledSkeletonTextLines';

export const GranolaConnectionCardSkeleton = () => (
  <StyledSettingsCard role="status" aria-label={t('Loading')}>
    <StyledSettingsCardContent>
      <StyledSkeletonBlock $width={32} $height={32} />
      <StyledSettingsCardTextContainer>
        <StyledSkeletonTextLines>
          <StyledSkeletonBlock $width={64} $height={13} />
          <StyledSkeletonBlock $width={240} $height={13} />
        </StyledSkeletonTextLines>
      </StyledSettingsCardTextContainer>
      <StyledSkeletonBlock $width={84} $height={20} />
    </StyledSettingsCardContent>
  </StyledSettingsCard>
);
