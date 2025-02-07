import { gql } from '@apollo/client';

export const SEND_TEMPLATE = gql`
  mutation SendTemplate($sendTemplateInput: SendTemplateInput!) {
    sendTemplate(sendTemplateInput: $sendTemplateInput)
  }
`;
