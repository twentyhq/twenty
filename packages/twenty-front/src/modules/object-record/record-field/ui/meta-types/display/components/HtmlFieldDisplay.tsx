import styled from '@emotion/styled';
import DOMPurify from 'dompurify';

import { useTextFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useTextFieldDisplay';

const StyledHtmlContainer = styled.div`
  overflow: hidden;
  overflow-wrap: anywhere;
  width: 100%;

  img {
    max-width: 100%;
  }
`;

export const HtmlFieldDisplay = () => {
  const { fieldValue } = useTextFieldDisplay();

  const sanitizedHtml = DOMPurify.sanitize(fieldValue);

  return (
    <StyledHtmlContainer
      // The value is authored server-side and sanitized here before rendering.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
