import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type DpaDocument } from '@/settings/legal/types/Dpa';

const StyledDocument = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  max-height: 460px;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledTitle = styled.h1`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledLastUpdated = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-bottom: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledHeading = styled.h2`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledParagraph = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  margin: ${themeCssVariables.spacing[2]} 0;
  text-align: justify;
`;

const StyledSignatureField = styled.div`
  margin: ${themeCssVariables.spacing[2]} 0;
`;

const StyledSignatureLabel = styled.div`
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledSignatureValue = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  white-space: pre-wrap;
`;

type DpaDocumentPreviewProps = {
  document: DpaDocument;
};

export const DpaDocumentPreview = ({ document }: DpaDocumentPreviewProps) => (
  // tabIndex makes the scrollable region focusable so keyboard-only users can
  // scroll the agreement with the arrow keys.
  <StyledDocument tabIndex={0} role="region" aria-label={document.title}>
    <StyledTitle>{document.title}</StyledTitle>
    <StyledLastUpdated>
      Last Updated: {document.lastUpdatedLabel}
    </StyledLastUpdated>
    {document.blocks.map((block, index) => {
      if (block.kind === 'heading') {
        return <StyledHeading key={index}>{block.text}</StyledHeading>;
      }

      if (block.kind === 'signatureField') {
        return (
          <StyledSignatureField key={index}>
            <StyledSignatureLabel>{block.label}</StyledSignatureLabel>
            <StyledSignatureValue>{block.value}</StyledSignatureValue>
          </StyledSignatureField>
        );
      }

      return <StyledParagraph key={index}>{block.text}</StyledParagraph>;
    })}
  </StyledDocument>
);
