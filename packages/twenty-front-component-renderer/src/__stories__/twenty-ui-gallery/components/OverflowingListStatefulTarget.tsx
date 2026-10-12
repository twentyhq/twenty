import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';

type OverflowingListStatefulTargetProps = {
  target: string;
  idPrefix: string;
  onSelect: (target: string) => void;
};

export const OverflowingListStatefulTarget = ({
  target,
  idPrefix,
  onSelect,
}: OverflowingListStatefulTargetProps) => {
  const [activations, setActivations] = useState(0);
  const buttonId = `${idPrefix}-${target.toLowerCase()}`;
  const descriptionId = `${buttonId}-description`;

  return (
    <div>
      <Button
        id={buttonId}
        aria-label={target}
        aria-describedby={descriptionId}
        onClick={() => {
          setActivations((count) => count + 1);
          onSelect(target);
        }}
      >
        {target}
      </Button>
      <output id={descriptionId} aria-label={`${target} activations`}>
        {activations}
      </output>
    </div>
  );
};
