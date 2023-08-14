import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ModalWrapper } from '@/spreadsheet-import/components/core/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/core/Providers';
import { ValidationStep } from '@/spreadsheet-import/components/steps/ValidationStep/ValidationStep';
import {
  defaultRSIProps,
  defaultTheme,
} from '@/spreadsheet-import/ReactSpreadsheetImport';

import '@testing-library/jest-dom';

const mockValues = {
  ...defaultRSIProps,
  fields: [],
  onSubmit: () => {},
  isOpen: true,
  onClose: () => {},
} as const;

const getFilterSwitch = () =>
  screen.getByRole('checkbox', {
    name: 'Show only rows with errors',
  });

const file = new File([''], 'file.csv');

describe('Validation step tests', () => {
  test('Submit data', async () => {
    const onSubmit = jest.fn();
    render(
      <Providers
        theme={defaultTheme}
        rsiValues={{ ...mockValues, onSubmit: onSubmit }}
      >
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={[]} file={file} />
        </ModalWrapper>
      </Providers>,
    );

    const finishButton = screen.getByRole('button', {
      name: 'Confirm',
    });

    await userEvent.click(finishButton);

    await waitFor(() => {
      expect(onSubmit).toBeCalledWith(
        { all: [], invalidData: [], validData: [] },
        file,
      );
    });
  });

  test('Filters rows with required errors', async () => {
    const UNIQUE_NAME = 'very unique name';
    const initialData = [
      {
        name: UNIQUE_NAME,
      },
      {
        name: undefined,
      },
    ];
    const fields = [
      {
        icon: null,
        label: 'Name',
        key: 'name',
        fieldType: {
          type: 'input',
        },
        validations: [
          {
            rule: 'required',
            errorMessage: 'Name is required',
          },
        ],
      },
    ] as const;
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    );

    const allRowsWithHeader = await screen.findAllByRole('row');
    expect(allRowsWithHeader).toHaveLength(3);

    const validRow = screen.getByText(UNIQUE_NAME);
    expect(validRow).toBeInTheDocument();

    const switchFilter = getFilterSwitch();

    await userEvent.click(switchFilter);

    const filteredRowsWithHeader = await screen.findAllByRole('row');
    expect(filteredRowsWithHeader).toHaveLength(2);
  });

  test('Filters rows with errors, fixes row, removes filter', async () => {
    const UNIQUE_NAME = 'very unique name';
    const SECOND_UNIQUE_NAME = 'another unique name';
    const FINAL_NAME = 'just name';
    const initialData = [
      {
        name: UNIQUE_NAME,
      },
      {
        name: undefined,
      },
      {
        name: SECOND_UNIQUE_NAME,
      },
    ];
    const fields = [
      {
        icon: null,
        label: 'Name',
        key: 'name',
        fieldType: {
          type: 'input',
        },
        validations: [
          {
            rule: 'required',
            errorMessage: 'Name is required',
          },
        ],
      },
    ] as const;

    const onSubmit = jest.fn();
    render(
      <Providers
        theme={defaultTheme}
        rsiValues={{ ...mockValues, fields, onSubmit }}
      >
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    );

    const allRowsWithHeader = await screen.findAllByRole('row');
    expect(allRowsWithHeader).toHaveLength(4);

    const validRow = screen.getByText(UNIQUE_NAME);
    expect(validRow).toBeInTheDocument();

    const switchFilter = getFilterSwitch();

    await userEvent.click(switchFilter);

    const filteredRowsWithHeader = await screen.findAllByRole('row');
    expect(filteredRowsWithHeader).toHaveLength(2);

    // don't really know another way to select an empty cell
    const emptyCell = screen.getAllByRole('gridcell', { name: undefined })[1];
    await userEvent.click(emptyCell);

    await userEvent.keyboard(FINAL_NAME + '{enter}');

    const filteredRowsNoErrorsWithHeader = await screen.findAllByRole('row');
    expect(filteredRowsNoErrorsWithHeader).toHaveLength(1);

    await userEvent.click(switchFilter);

    const allRowsFixedWithHeader = await screen.findAllByRole('row');
    expect(allRowsFixedWithHeader).toHaveLength(4);

    const finishButton = screen.getByRole('button', {
      name: 'Confirm',
    });

    await userEvent.click(finishButton);

    await waitFor(() => {
      expect(onSubmit).toBeCalled();
    });
  });

  test('Filters rows with unique errors', async () => {
    const NON_UNIQUE_NAME = 'very unique name';
    const initialData = [
      {
        name: NON_UNIQUE_NAME,
      },
      {
        name: NON_UNIQUE_NAME,
      },
      {
        name: 'I am fine',
      },
    ];
    const fields = [
      {
        icon: null,
        label: 'Name',
        key: 'name',
        fieldType: {
          type: 'input',
        },
        validations: [
          {
            rule: 'unique',
            errorMessage: 'Name must be unique',
          },
        ],
      },
    ] as const;
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    );

    const allRowsWithHeader = await screen.findAllByRole('row');
    expect(allRowsWithHeader).toHaveLength(4);

    const switchFilter = getFilterSwitch();

    await userEvent.click(switchFilter);

    const filteredRowsWithHeader = await screen.findAllByRole('row');
    expect(filteredRowsWithHeader).toHaveLength(3);
  });
  test('Filters rows with regex errors', async () => {
    const NOT_A_NUMBER = 'not a number';
    const initialData = [
      {
        name: NOT_A_NUMBER,
      },
      {
        name: '1234',
      },
      {
        name: '9999999',
      },
    ];
    const fields = [
      {
        icon: null,
        label: 'Name',
        key: 'name',
        fieldType: {
          type: 'input',
        },
        validations: [
          {
            rule: 'regex',
            errorMessage: 'Name must be unique',
            value: '^[0-9]*$',
          },
        ],
      },
    ] as const;
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    );

    const allRowsWithHeader = await screen.findAllByRole('row');
    expect(allRowsWithHeader).toHaveLength(4);

    const switchFilter = getFilterSwitch();

    await userEvent.click(switchFilter);

    const filteredRowsWithHeader = await screen.findAllByRole('row');
    expect(filteredRowsWithHeader).toHaveLength(2);
  });

  test('Deletes selected rows', async () => {
    const FIRST_DELETE = 'first';
    const SECOND_DELETE = 'second';
    const THIRD = 'third';

    const initialData = [
      {
        name: FIRST_DELETE,
      },
      {
        name: SECOND_DELETE,
      },
      {
        name: THIRD,
      },
    ];
    const fields = [
      {
        icon: null,
        label: 'Name',
        key: 'name',
        fieldType: {
          type: 'input',
        },
      },
    ] as const;
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    );

    const allRowsWithHeader = await screen.findAllByRole('row');
    expect(allRowsWithHeader).toHaveLength(4);

    const switchFilters = screen.getAllByRole('checkbox', {
      name: 'Select',
    });

    await userEvent.click(switchFilters[0]);
    await userEvent.click(switchFilters[1]);

    const discardButton = screen.getByRole('button', {
      name: 'Discard selected rows',
    });

    await userEvent.click(discardButton);

    const filteredRowsWithHeader = await screen.findAllByRole('row');
    expect(filteredRowsWithHeader).toHaveLength(2);

    const validRow = screen.getByText(THIRD);
    expect(validRow).toBeInTheDocument();
  });

  test('Deletes selected rows, changes the last one', async () => {
    const FIRST_DELETE = 'first';
    const SECOND_DELETE = 'second';
    const THIRD = 'third';
    const THIRD_CHANGED = 'third_changed';

    const initialData = [
      {
        name: FIRST_DELETE,
      },
      {
        name: SECOND_DELETE,
      },
      {
        name: THIRD,
      },
    ];
    const fields = [
      {
        icon: null,
        label: 'Name',
        key: 'name',
        fieldType: {
          type: 'input',
        },
      },
    ] as const;
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    );

    const allRowsWithHeader = await screen.findAllByRole('row');
    expect(allRowsWithHeader).toHaveLength(4);

    const switchFilters = screen.getAllByRole('checkbox', {
      name: 'Select',
    });

    await userEvent.click(switchFilters[0]);
    await userEvent.click(switchFilters[1]);

    const discardButton = screen.getByRole('button', {
      name: 'Discard selected rows',
    });

    await userEvent.click(discardButton);

    const filteredRowsWithHeader = await screen.findAllByRole('row');
    expect(filteredRowsWithHeader).toHaveLength(2);

    const nameCell = screen.getByRole('gridcell', {
      name: THIRD,
    });

    await userEvent.click(nameCell);

    screen.getByRole<HTMLInputElement>('textbox');
    await userEvent.keyboard(THIRD_CHANGED + '{enter}');

    const validRow = screen.getByText(THIRD_CHANGED);
    expect(validRow).toBeInTheDocument();
  });

  test('All inputs change values', async () => {
    const NAME = 'John';
    const NEW_NAME = 'Johnny';
    const OPTIONS = [
      { value: 'one', label: 'ONE' },
      { value: 'two', label: 'TWO' },
    ] as const;
    const initialData = [
      {
        name: NAME,
        lastName: OPTIONS[0].value,
        is_cool: false,
      },
    ];
    const fields = [
      {
        icon: null,
        label: 'Name',
        key: 'name',
        fieldType: {
          type: 'input',
        },
      },
      {
        icon: null,
        label: 'lastName',
        key: 'lastName',
        fieldType: {
          type: 'select',
          options: OPTIONS,
        },
      },
      {
        icon: null,
        label: 'is cool',
        key: 'is_cool',
        fieldType: {
          type: 'checkbox',
        },
      },
    ] as const;

    render(
      <Providers
        theme={defaultTheme}
        rsiValues={{
          ...mockValues,
          fields,
        }}
      >
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    );

    // input
    const nameCell = screen.getByRole('gridcell', {
      name: NAME,
    });

    await userEvent.click(nameCell);

    const input: HTMLInputElement | null =
      screen.getByRole<HTMLInputElement>('textbox');

    expect(input).toHaveValue(NAME);
    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(NAME.length);

    await userEvent.keyboard(NEW_NAME + '{enter}');
    expect(input).not.toBeInTheDocument();

    const newNameCell = screen.getByRole('gridcell', {
      name: NEW_NAME,
    });
    expect(newNameCell).toBeInTheDocument();

    // select
    const lastNameCell = screen.getByRole('gridcell', {
      name: OPTIONS[0].label,
    });
    await userEvent.click(lastNameCell);

    const newOption = screen.getByRole('button', {
      name: OPTIONS[1].label,
    });
    await userEvent.click(newOption);
    expect(newOption).not.toBeInTheDocument();

    const newLastName = screen.getByRole('gridcell', {
      name: OPTIONS[1].label,
    });
    expect(newLastName).toBeInTheDocument();

    // Boolean
    const checkbox = screen.getByRole('checkbox', {
      name: '',
    });

    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  // test("Init hook transforms data", async () => {
  //   const NAME = "John"
  //   const LASTNAME = "Doe"
  //   const initialData = [
  //     {
  //       name: NAME + " " + LASTNAME,
  //       lastName: undefined,
  //     },
  //   ]
  //   const fields = [
  //     {
  //       label: "heyo",
  //       key: "heyo",
  //       fieldType: {
  //         type: "input",
  //       },
  //     },
  //     {
  //       label: "Name",
  //       key: "name",
  //       fieldType: {
  //         type: "input",
  //       },
  //     },
  //     {
  //       label: "lastName",
  //       key: "lastName",
  //       fieldType: {
  //         type: "input",
  //       },
  //     },
  //   ] as const
  //
  //   render(
  //     <Providers
  //       theme={defaultTheme}
  //       rsiValues={{
  //         ...mockValues,
  //         fields,
  //         validationStepHook: async (data) =>
  //           data.map((value) => ({
  //             name: value.name?.toString()?.split(/(\s+)/)[0],
  //             lastName: value.name?.toString()?.split(/(\s+)/)[2],
  //           })),
  //       }}
  //     >
  //       <ModalWrapper isOpen={true} onClose={() => {}}>
  //         <ValidationStep initialData={initialData} />
  //       </ModalWrapper>
  //     </Providers>,
  //   )
  //
  //   const nameCell = screen.getByRole("gridcell", {
  //     name: NAME,
  //   })
  //   expect(nameCell).toBeInTheDocument()
  //   const lastNameCell = screen.getByRole("gridcell", {
  //     name: LASTNAME,
  //   })
  //   expect(lastNameCell).toBeInTheDocument()
  // })

  test('Row hook transforms data', async () => {
    const NAME = 'John';
    const LASTNAME = 'Doe';
    const NEW_NAME = 'Johnny';
    const NEW_LASTNAME = 'CENA';
    const initialData = [
      {
        name: NAME + ' ' + LASTNAME,
        lastName: undefined,
      },
    ];
    const fields = [
      {
        icon: null,
        label: 'Name',
        key: 'name',
        fieldType: {
          type: 'input',
        },
      },
      {
        icon: null,
        label: 'lastName',
        key: 'lastName',
        fieldType: {
          type: 'input',
        },
      },
    ] as const;

    render(
      <Providers
        theme={defaultTheme}
        rsiValues={{
          ...mockValues,
          fields,
          rowHook: (value) => ({
            name: value.name?.toString()?.split(/(\s+)/)[0],
            lastName: value.name?.toString()?.split(/(\s+)/)[2],
          }),
        }}
      >
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    );

    const nameCell = screen.getByRole('gridcell', {
      name: NAME,
    });
    expect(nameCell).toBeInTheDocument();
    const lastNameCell = screen.getByRole('gridcell', {
      name: LASTNAME,
    });
    expect(lastNameCell).toBeInTheDocument();

    // activate input
    await userEvent.click(nameCell);

    await userEvent.keyboard(NEW_NAME + ' ' + NEW_LASTNAME + '{enter}');

    const newNameCell = screen.getByRole('gridcell', {
      name: NEW_NAME,
    });
    expect(newNameCell).toBeInTheDocument();
    const newLastNameCell = screen.getByRole('gridcell', {
      name: NEW_LASTNAME,
    });
    expect(newLastNameCell).toBeInTheDocument();
  });
  test('Row hook raises error', async () => {
    const WRONG_NAME = 'Johnny';
    const RIGHT_NAME = 'Jonathan';
    const initialData = [
      {
        name: WRONG_NAME,
      },
    ];
    const fields = [
      {
        icon: null,
        label: 'Name',
        key: 'name',
        fieldType: {
          type: 'input',
        },
      },
    ] as const;

    render(
      <Providers
        theme={defaultTheme}
        rsiValues={{
          ...mockValues,
          fields,
          rowHook: (value, setError) => {
            if (value.name === WRONG_NAME) {
              setError(fields[0].key, {
                message: 'Wrong name',
                level: 'error',
              });
            }
            return value;
          },
        }}
      >
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    );

    const switchFilter = getFilterSwitch();

    await expect(await screen.findAllByRole('row')).toHaveLength(2);

    await userEvent.click(switchFilter);

    await expect(await screen.findAllByRole('row')).toHaveLength(2);

    const nameCell = screen.getByRole('gridcell', {
      name: WRONG_NAME,
    });
    expect(nameCell).toBeInTheDocument();

    await userEvent.click(nameCell);
    screen.getByRole<HTMLInputElement>('textbox');

    await userEvent.keyboard(RIGHT_NAME + '{enter}');

    await expect(await screen.findAllByRole('row')).toHaveLength(1);
  });

  test('Table hook transforms data', async () => {
    const NAME = 'John';
    const SECOND_NAME = 'Doe';
    const NEW_NAME = 'Jakee';
    const ADDITION = 'last';
    const initialData = [
      {
        name: NAME,
      },
      {
        name: SECOND_NAME,
      },
    ];
    const fields = [
      {
        icon: null,
        label: 'Name',
        key: 'name',
        fieldType: {
          type: 'input',
        },
      },
    ] as const;

    render(
      <Providers
        theme={defaultTheme}
        rsiValues={{
          ...mockValues,
          fields,
          tableHook: (data) =>
            data.map((value) => ({
              name: value.name + ADDITION,
            })),
        }}
      >
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    );

    const nameCell = screen.getByRole('gridcell', {
      name: NAME + ADDITION,
    });
    expect(nameCell).toBeInTheDocument();
    const lastNameCell = screen.getByRole('gridcell', {
      name: SECOND_NAME + ADDITION,
    });
    expect(lastNameCell).toBeInTheDocument();

    // activate input
    await userEvent.click(nameCell);

    await userEvent.keyboard(NEW_NAME + '{enter}');

    const newNameCell = screen.getByRole('gridcell', {
      name: NEW_NAME + ADDITION,
    });
    expect(newNameCell).toBeInTheDocument();
  });
  test('Table hook raises error', async () => {
    const WRONG_NAME = 'Johnny';
    const RIGHT_NAME = 'Jonathan';
    const initialData = [
      {
        name: WRONG_NAME,
      },
      {
        name: WRONG_NAME,
      },
    ];
    const fields = [
      {
        icon: null,
        label: 'Name',
        key: 'name',
        fieldType: {
          type: 'input',
        },
      },
    ] as const;

    render(
      <Providers
        theme={defaultTheme}
        rsiValues={{
          ...mockValues,
          fields,
          tableHook: (data, setError) => {
            data.forEach((value, index) => {
              if (value.name === WRONG_NAME) {
                setError(index, fields[0].key, {
                  message: 'Wrong name',
                  level: 'error',
                });
              }
              return value;
            });
            return data;
          },
        }}
      >
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    );

    const switchFilter = getFilterSwitch();

    await expect(await screen.findAllByRole('row')).toHaveLength(3);

    await userEvent.click(switchFilter);

    await expect(await screen.findAllByRole('row')).toHaveLength(3);

    const nameCell = await screen.getAllByRole('gridcell', {
      name: WRONG_NAME,
    })[0];

    await userEvent.click(nameCell);
    screen.getByRole<HTMLInputElement>('textbox');

    await userEvent.keyboard(RIGHT_NAME + '{enter}');

    await expect(await screen.findAllByRole('row')).toHaveLength(2);
  });
});
