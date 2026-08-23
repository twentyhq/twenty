import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { useApplyNewSelectOptionFromSearchParams } from '@/settings/data-model/fields/forms/select/hooks/useApplyNewSelectOptionFromSearchParams';

const PERSISTED_OPTIONS: FieldMetadataItemOption[] = [
  { id: 'option-1', color: 'green', label: 'New', value: 'NEW', position: 0 },
];

const FIELD_METADATA_ID = 'field-metadata-id';

const getWrapper =
  (search: string) =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter
      initialEntries={[`/settings/objects/opportunities/stage${search}`]}
    >
      {children}
    </MemoryRouter>
  );

const renderApplyNewSelectOptionHook = ({
  search,
  optionsByRender,
}: {
  search: string;
  optionsByRender: (FieldMetadataItemOption[] | undefined)[];
}) => {
  const setValue = jest.fn();

  let currentOptions = optionsByRender[0];
  const getValues = jest.fn(() => currentOptions);

  const { rerender } = renderHook(
    ({ fieldMetadataId }: { fieldMetadataId: string | undefined }) =>
      useApplyNewSelectOptionFromSearchParams({
        fieldMetadataId,
        getValues,
        setValue,
      }),
    {
      wrapper: getWrapper(search),
      initialProps: {
        fieldMetadataId:
          optionsByRender[0] === undefined ? undefined : FIELD_METADATA_ID,
      },
    },
  );

  const renderNext = (options: FieldMetadataItemOption[] | undefined) => {
    currentOptions = options;
    rerender({
      fieldMetadataId: options === undefined ? undefined : FIELD_METADATA_ID,
    });
  };

  return { setValue, renderNext };
};

describe('useApplyNewSelectOptionFromSearchParams', () => {
  it('appends the option named in the URL to the options already on the field', () => {
    const { setValue } = renderApplyNewSelectOptionHook({
      search: '?newOption=Negotiation',
      optionsByRender: [PERSISTED_OPTIONS],
    });

    expect(setValue).toHaveBeenCalledTimes(1);

    const [name, nextOptions, config] = setValue.mock.calls[0];

    expect(name).toBe('options');
    expect(config).toEqual({ shouldDirty: true });
    expect(nextOptions).toHaveLength(2);
    expect(nextOptions[0]).toEqual(PERSISTED_OPTIONS[0]);
    expect(nextOptions[1].label).toBe('Negotiation');
  });

  it('waits for the field to register instead of giving up on the first miss', () => {
    const { setValue, renderNext } = renderApplyNewSelectOptionHook({
      search: '?newOption=Negotiation',
      optionsByRender: [undefined],
    });

    expect(setValue).not.toHaveBeenCalled();

    renderNext(PERSISTED_OPTIONS);

    expect(setValue).toHaveBeenCalledTimes(1);
    expect(setValue.mock.calls[0][1]).toHaveLength(2);
  });

  it('applies the option only once', () => {
    const { setValue, renderNext } = renderApplyNewSelectOptionHook({
      search: '?newOption=Negotiation',
      optionsByRender: [PERSISTED_OPTIONS],
    });

    renderNext(PERSISTED_OPTIONS);
    renderNext(PERSISTED_OPTIONS);

    expect(setValue).toHaveBeenCalledTimes(1);
  });

  it('leaves the form untouched when the URL carries no new option', () => {
    const { setValue, renderNext } = renderApplyNewSelectOptionHook({
      search: '',
      optionsByRender: [PERSISTED_OPTIONS],
    });

    renderNext(PERSISTED_OPTIONS);

    expect(setValue).not.toHaveBeenCalled();
  });
});
