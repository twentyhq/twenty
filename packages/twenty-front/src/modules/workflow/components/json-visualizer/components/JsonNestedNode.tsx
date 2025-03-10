import { JsonArrow } from '@/workflow/components/json-visualizer/components/internal/JsonArrow';
import { JsonList } from '@/workflow/components/json-visualizer/components/internal/JsonList';
import { JsonNodeLabel } from '@/workflow/components/json-visualizer/components/internal/JsonNodeLabel';
import { JsonNode } from '@/workflow/components/json-visualizer/components/JsonNode';
import styled from '@emotion/styled';
import { useState } from 'react';
import { isDefined } from 'twenty-shared';
import { IconComponent } from 'twenty-ui';
import { JsonValue } from 'type-fest';

const StyledContainer = styled.li`
  list-style-type: none;
  display: grid;
  row-gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledElementsCount = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const JsonNestedNode = ({
  label,
  Icon,
  elements,
  renderElementsCount,
  emptyElementsText,
  depth,
  keyPath,
  getNodeHighlighting,
}: {
  label?: string;
  Icon: IconComponent;
  elements: Array<{ id: string | number; label: string; value: JsonValue }>;
  renderElementsCount?: (count: number) => string;
  emptyElementsText: string;
  depth: number;
  keyPath: string;
  getNodeHighlighting?: (keyPath: string) => boolean;
}) => {
  const hideRoot = !isDefined(label);

  const [isOpen, setIsOpen] = useState(true);

  const renderedChildren = (
    <JsonList depth={depth}>
      {elements.length === 0 ? (
        <StyledEmptyState>{emptyElementsText}</StyledEmptyState>
      ) : (
        elements.map(({ id, label, value }) => (
          <JsonNode
            key={id}
            label={label}
            value={value}
            depth={depth + 1}
            keyPath={keyPath + '.' + id}
            getNodeHighlighting={getNodeHighlighting}
          />
        ))
      )}
    </JsonList>
  );

  const handleArrowClick = () => {
    setIsOpen(!isOpen);
  };

  if (hideRoot) {
    return <StyledContainer>{renderedChildren}</StyledContainer>;
  }

  return (
    <StyledContainer>
      <StyledLabelContainer>
        <JsonArrow isOpen={isOpen} onClick={handleArrowClick} />

        <JsonNodeLabel label={label} Icon={Icon} />

        {renderElementsCount && (
          <StyledElementsCount>
            {renderElementsCount(elements.length)}
          </StyledElementsCount>
        )}
      </StyledLabelContainer>

      {isOpen && renderedChildren}
    </StyledContainer>
  );
};
