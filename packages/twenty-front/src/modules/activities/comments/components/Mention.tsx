import { createReactInlineContentSpec } from '@blocknote/react';
import styled from '@emotion/styled';

const StyledMention = styled.span`
  background-color: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.color.blue};
  padding: 0 ${({ theme }) => theme.spacing(1)};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.medium};
  }
`;

export const Mention = createReactInlineContentSpec(
  {
    type: 'mention',
    propSchema: {
      userId: {
        default: '',
      },
      name: {
        default: 'Unknown',
      },
    },
    content: 'none',
  },
  {
    render: (props) => (
      <StyledMention>@{props.inlineContent.props.name}</StyledMention>
    ),
  },
);
