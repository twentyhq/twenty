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

export const JsonNestedNode = ({
  label,
  Icon,
  elements,
  depth,
}: {
  label?: string;
  Icon: IconComponent;
  elements: Array<{ key: string; value: JsonValue }>;
  depth: number;
}) => {
  const hideRoot = !isDefined(label);

  const [isOpen, setIsOpen] = useState(true);

  const renderedChildren = (
    <JsonList depth={depth}>
      {elements.map(({ key, value }) => (
        <JsonNode key={key} label={key} value={value} depth={depth + 1} />
      ))}
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
      </StyledLabelContainer>

      {isOpen && renderedChildren}
    </StyledContainer>
  );
};
