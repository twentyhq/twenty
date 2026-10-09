import { useState } from 'react';
import { Avatar } from 'twenty-ui/primitives/data-display';

type StatefulGroupAvatarProps = {
  name: string;
};

export const StatefulGroupAvatar = ({ name }: StatefulGroupAvatarProps) => {
  const [activations, setActivations] = useState(0);

  return (
    <button
      type="button"
      aria-label={`${name} activations ${activations}`}
      onClick={() => setActivations((count) => count + 1)}
      style={{ border: 0, padding: 0, background: 'none' }}
    >
      <Avatar name={name} />
    </button>
  );
};
