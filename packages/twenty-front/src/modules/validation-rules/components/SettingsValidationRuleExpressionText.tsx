import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { VALIDATION_RULE_HIGHLIGHT_COLORS } from '@/validation-rules/constants/ValidationRuleHighlightColors';
import { type ValidationRuleExpressionHighlightKind } from '@/validation-rules/types/ValidationRuleExpressionHighlight';
import { computeValidationRuleExpressionHighlights } from '@/validation-rules/utils/computeValidationRuleExpressionHighlights';

const StyledExpression = styled.span`
  font-family: ${themeCssVariables.code.font.family};
`;

const StyledToken = styled.span<{
  kind: ValidationRuleExpressionHighlightKind;
}>`
  color: ${({ kind }) => VALIDATION_RULE_HIGHLIGHT_COLORS[kind]};
`;

type SettingsValidationRuleExpressionTextProps = {
  expression: string;
  className?: string;
};

export const SettingsValidationRuleExpressionText = ({
  expression,
  className,
}: SettingsValidationRuleExpressionTextProps) => {
  const highlights = computeValidationRuleExpressionHighlights(expression);

  const parts = highlights.reduce<{
    nodes: ReactNode[];
    offset: number;
  }>(
    ({ nodes, offset }, { kind, start, end }) => ({
      nodes: [
        ...nodes,
        expression.slice(offset, start),
        <StyledToken key={start} kind={kind}>
          {expression.slice(start, end)}
        </StyledToken>,
      ],
      offset: end,
    }),
    { nodes: [], offset: 0 },
  );

  return (
    <StyledExpression className={className}>
      {parts.nodes}
      {expression.slice(parts.offset)}
    </StyledExpression>
  );
};
