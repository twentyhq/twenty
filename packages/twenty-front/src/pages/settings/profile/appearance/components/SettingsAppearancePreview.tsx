import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import { themeCssVariables } from 'twenty-ui/theme';
import { doNotTranslate } from 'twenty-shared/i18n';
import { type AppearanceValue } from '@/salesfarce/types/AppearanceValue';
import { getAppearancePreviewColors } from '~/pages/settings/profile/appearance/utils/getAppearancePreviewColors';

const StyledPreview = styled.div`
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  height: 80px;
  overflow: hidden;
  width: 100%;
`;

const StyledSegment = styled.div`
  align-items: flex-end;
  background: var(--appearance-preview-background);
  border: 1px solid var(--appearance-preview-border);
  box-sizing: border-box;
  display: flex;
  flex: 1;
  min-width: 0;
  padding-inline-start: ${themeCssVariables.spacing[6]};
  padding-top: ${themeCssVariables.spacing[6]};

  &:first-child {
    border-end-start-radius: ${themeCssVariables.border.radius.md};
    border-start-start-radius: ${themeCssVariables.border.radius.md};
  }

  &:last-child {
    border-end-end-radius: ${themeCssVariables.border.radius.md};
    border-start-end-radius: ${themeCssVariables.border.radius.md};
  }
`;

const StyledContent = styled.div`
  background: var(--appearance-preview-content-background);
  border-inline-start: 1px solid var(--appearance-preview-border);
  border-start-start-radius: ${themeCssVariables.border.radius.md};
  border-top: 1px solid var(--appearance-preview-border);
  box-sizing: border-box;
  color: var(--appearance-preview-content-color);
  flex: 1;
  font-size: 20px;
  height: 56px;
  padding-inline-start: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
  transition:
    height 0.1s ease-in-out,
    font-size 0.1s ease-in-out;

  @media (hover: hover) {
    [role='radio']:not([data-disabled]):hover > ${StyledPreview} & {
      font-size: 22px;
      height: 61px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

type SettingsAppearancePreviewProps = {
  appearance: AppearanceValue;
};

export const SettingsAppearancePreview = ({
  appearance,
}: SettingsAppearancePreviewProps) => {
  const segments = doNotTranslate<AppearanceValue[]>(
    appearance === 'System' ? ['Light', 'Dark'] : [appearance],
  );

  return (
    <StyledPreview aria-hidden>
      {segments.map((segment) => {
        const previewColors = getAppearancePreviewColors(segment);

        return (
          <StyledSegment
            key={segment}
            style={
              {
                '--appearance-preview-background': previewColors.background,
                '--appearance-preview-border': previewColors.border,
                '--appearance-preview-content-background':
                  previewColors.contentBackground,
                '--appearance-preview-content-color':
                  previewColors.contentColor,
              } as CSSProperties
            }
          >
            <StyledContent>Aa</StyledContent>
          </StyledSegment>
        );
      })}
    </StyledPreview>
  );
};
