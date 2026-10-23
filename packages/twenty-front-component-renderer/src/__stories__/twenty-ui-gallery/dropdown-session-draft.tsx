import { useState } from 'react';
import { Input } from 'twenty-ui/primitives/input';

export const DropdownSessionDraft = () => {
  const [note, setNote] = useState('');

  return (
    <Input aria-label="Assignment note" value={note} onValueChange={setNote} />
  );
};
