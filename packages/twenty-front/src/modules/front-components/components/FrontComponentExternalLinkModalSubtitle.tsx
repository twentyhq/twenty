import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { useId } from 'react';
import { Checkbox } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  overflow-wrap: anywhere;
`;

const StyledTrustRow = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  text-align: left;
`;

const StyledTrustLabel = styled.span`
  cursor: pointer;
`;

type FrontComponentExternalLinkModalSubtitleProps = {
  url: string;
  origin: string;
  shouldTrustOrigin: boolean;
  onShouldTrustOriginChange: (shouldTrustOrigin: boolean) => void;
};

export const FrontComponentExternalLinkModalSubtitle = ({
  url,
  origin,
  shouldTrustOrigin,
  onShouldTrustOriginChange,
}: FrontComponentExternalLinkModalSubtitleProps) => {
  const trustOriginLabelId = useId();

  return (
    <StyledContent>
      <span>
        <Trans>
          This link will take you to an external site: <strong>{url}</strong>
        </Trans>
      </span>
      <StyledTrustRow>
        <Checkbox
          checked={shouldTrustOrigin}
          onCheckedChange={onShouldTrustOriginChange}
          aria-labelledby={trustOriginLabelId}
        />
        <StyledTrustLabel
          id={trustOriginLabelId}
          onClick={() => onShouldTrustOriginChange(!shouldTrustOrigin)}
        >
          <Trans>
            Don't ask again for <strong>{origin}</strong>
          </Trans>
        </StyledTrustLabel>
      </StyledTrustRow>
    </StyledContent>
  );
};
