import { ResizeHandle } from 'twenty-ui/primitives/layout';

export const DirectionalResizeExample = ({ name }: { name: string }) => (
  <ResizeHandle
    aria-label={name}
    axis="x"
    defaultValue={100}
    min={50}
    max={150}
    step={10}
  />
);
