import styled from '@emotion/styled';
import { type IconComponent } from 'twenty-ui/icon';
import { ICON } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledMetadata = styled.span`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing['0.5']};
`;

const StyledMetadataIconContainer = styled.span`
  align-items: center;
  color: ${() => themeCssVariables.font.color.light};
  display: flex;
`;

type CallRecordingRowMetadataProps = {
  Icon: IconComponent;
  text: string;
};

export const CallRecordingRowMetadata = ({
  Icon,
  text,
}: CallRecordingRowMetadataProps) => (
  <StyledMetadata>
    <StyledMetadataIconContainer>
      <Icon size={ICON.size.md} />
    </StyledMetadataIconContainer>
    {text}
  </StyledMetadata>
);
