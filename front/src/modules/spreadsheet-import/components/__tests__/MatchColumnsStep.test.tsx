import selectEvent from 'react-select-event';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ModalWrapper } from '@/spreadsheet-import/components/core/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/core/Providers';
import { MatchColumnsStep } from '@/spreadsheet-import/components/steps/MatchColumnsStep/MatchColumnsStep';
import { StepType } from '@/spreadsheet-import/components/steps/UploadFlow';
import {
  defaultTheme,
  ReactSpreadsheetImport,
} from '@/spreadsheet-import/ReactSpreadsheetImport';
import { mockRsiValues } from '@/spreadsheet-import/stories/mockRsiValues';
import { translations } from '@/spreadsheet-import/translationsRSIProps';
import type { Fields } from '@/spreadsheet-import/types';

import '@testing-library/jest-dom';

// TODO: fix this test
const SELECT_DROPDOWN_ID = 'select-dropdown';

const fields: Fields<any> = [
  {
    icon: null,
    label: 'Name',
    key: 'name',
    fieldType: {
      type: 'input',
    },
    example: 'Stephanie',
  },
  {
    icon: null,
    label: 'Mobile Phone',
    key: 'mobile',
    fieldType: {
      type: 'input',
    },
    example: '+12323423',
  },
  {
    icon: null,
    label: 'Is cool',
    key: 'is_cool',
    fieldType: {
      type: 'checkbox',
    },
    example: 'No',
  },
];

const CONTINUE_BUTTON = 'Next';
const MUTATED_ENTRY = 'mutated entry';
const ERROR_MESSAGE = 'Something happened';

describe('Match Columns automatic matching', () => {
  test('AutoMatch column and click next', async () => {
    const header = ['namezz', 'Phone', 'Email'];
    const data = [
      ['John', '123', 'j@j.com'],
      ['Dane', '333', 'dane@bane.com'],
      ['Kane', '534', 'kane@linch.com'],
    ];
    // finds only names with automatic matching
    const result = [
      { name: data[0][0] },
      { name: data[1][0] },
      { name: data[2][0] },
    ];

    const onContinue = jest.fn();
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
        </ModalWrapper>
      </Providers>,
    );

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    });

    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(onContinue).toBeCalled();
    });
    expect(onContinue.mock.calls[0][0]).toEqual(result);
  });

  test('AutoMatching disabled does not match any columns', async () => {
    const header = ['Name', 'Phone', 'Email'];
    const data = [
      ['John', '123', 'j@j.com'],
      ['Dane', '333', 'dane@bane.com'],
      ['Kane', '534', 'kane@linch.com'],
    ];
    // finds only names with automatic matching
    const result = [{}, {}, {}];

    const onContinue = jest.fn();
    render(
      <Providers
        theme={defaultTheme}
        rsiValues={{ ...mockRsiValues, fields, autoMapHeaders: false }}
      >
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
        </ModalWrapper>
      </Providers>,
    );

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    });

    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(onContinue).toBeCalled();
    });
    expect(onContinue.mock.calls[0][0]).toEqual(result);
  });

  test('AutoMatching exact values', async () => {
    const header = ['Name', 'Phone', 'Email'];
    const data = [
      ['John', '123', 'j@j.com'],
      ['Dane', '333', 'dane@bane.com'],
      ['Kane', '534', 'kane@linch.com'],
    ];
    // finds only names with automatic matching
    const result = [
      { name: data[0][0] },
      { name: data[1][0] },
      { name: data[2][0] },
    ];

    const onContinue = jest.fn();
    render(
      <Providers
        theme={defaultTheme}
        rsiValues={{ ...mockRsiValues, fields, autoMapDistance: 1 }}
      >
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
        </ModalWrapper>
      </Providers>,
    );

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    });

    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(onContinue).toBeCalled();
    });
    expect(onContinue.mock.calls[0][0]).toEqual(result);
  });

  test('AutoMatches only one value', async () => {
    const header = ['first name', 'name', 'Email'];
    const data = [
      ['John', '123', 'j@j.com'],
      ['Dane', '333', 'dane@bane.com'],
      ['Kane', '534', 'kane@linch.com'],
    ];
    // finds only names with automatic matching
    const result = [
      { name: data[0][1] },
      { name: data[1][1] },
      { name: data[2][1] },
    ];

    const alternativeFields = [
      {
        icon: null,
        label: 'Name',
        key: 'name',
        alternateMatches: ['first name'],
        fieldType: {
          type: 'input',
        },
        example: 'Stephanie',
      },
    ] as const;

    const onContinue = jest.fn();
    render(
      <Providers
        theme={defaultTheme}
        rsiValues={{ ...mockRsiValues, fields: alternativeFields }}
      >
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
        </ModalWrapper>
      </Providers>,
    );

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    });

    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(onContinue).toBeCalled();
    });
    expect(onContinue.mock.calls[0][0]).toEqual(result);
  });

  test('Boolean-like values are returned as Booleans', async () => {
    const header = ['namezz', 'is_cool', 'Email'];
    const data = [
      ['John', 'yes', 'j@j.com'],
      ['Dane', 'TRUE', 'dane@bane.com'],
      ['Kane', 'false', 'kane@linch.com'],
      ['Kaney', 'no', 'kane@linch.com'],
      ['Kanye', 'maybe', 'kane@linch.com'],
    ];

    const result = [
      { name: data[0][0], is_cool: true },
      { name: data[1][0], is_cool: true },
      { name: data[2][0], is_cool: false },
      { name: data[3][0], is_cool: false },
      { name: data[4][0], is_cool: false },
    ];

    const onContinue = jest.fn();
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
        </ModalWrapper>
      </Providers>,
    );

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    });

    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(onContinue).toBeCalled();
    });
    expect(onContinue.mock.calls[0][0]).toEqual(result);
  });

  test("Boolean-like values are returned as Booleans for 'booleanMatches' props", async () => {
    const BOOLEAN_MATCHES_VALUE = 'definitely';
    const header = ['is_cool'];
    const data = [['true'], ['false'], [BOOLEAN_MATCHES_VALUE]];

    const fields = [
      {
        icon: null,
        label: 'Is cool',
        key: 'is_cool',
        fieldType: {
          type: 'checkbox',
          booleanMatches: { [BOOLEAN_MATCHES_VALUE]: true },
        },
        example: 'No',
      },
    ] as const;

    const result = [{ is_cool: true }, { is_cool: false }, { is_cool: true }];

    const onContinue = jest.fn();
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
        </ModalWrapper>
      </Providers>,
    );

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    });

    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(onContinue).toBeCalled();
    });
    expect(onContinue.mock.calls[0][0]).toEqual(result);
  });
});

describe('Match Columns general tests', () => {
  test('Displays all user header columns', async () => {
    const header = ['namezz', 'Phone', 'Email'];
    const data = [
      ['John', '123', 'j@j.com'],
      ['Dane', '333', 'dane@bane.com'],
      ['Kane', '534', 'kane@linch.com'],
    ];

    const onContinue = jest.fn();
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
        </ModalWrapper>
      </Providers>,
    );

    expect(screen.getByText(header[0])).toBeInTheDocument();
    expect(screen.getByText(header[1])).toBeInTheDocument();
    expect(screen.getByText(header[2])).toBeInTheDocument();
  });

  test('Displays two rows of example data', async () => {
    const header = ['namezz', 'Phone', 'Email'];
    const data = [
      ['John', '123', 'j@j.com'],
      ['Dane', '333', 'dane@bane.com'],
      ['Kane', '534', 'kane@linch.com'],
    ];

    const onContinue = jest.fn();
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
        </ModalWrapper>
      </Providers>,
    );

    // only displays two rows
    expect(screen.queryByText(data[0][0])).toBeInTheDocument();
    expect(screen.queryByText(data[0][1])).toBeInTheDocument();
    expect(screen.queryByText(data[0][2])).toBeInTheDocument();
    expect(screen.queryByText(data[1][0])).toBeInTheDocument();
    expect(screen.queryByText(data[1][1])).toBeInTheDocument();
    expect(screen.queryByText(data[1][2])).toBeInTheDocument();
    expect(screen.queryByText(data[2][0])).not.toBeInTheDocument();
    expect(screen.queryByText(data[2][1])).not.toBeInTheDocument();
    expect(screen.queryByText(data[2][2])).not.toBeInTheDocument();
  });

  test('Displays all fields in selects dropdown', async () => {
    const header = ['Something random', 'Phone', 'Email'];
    const data = [
      ['John', '123', 'j@j.com'],
      ['Dane', '333', 'dane@bane.com'],
      ['Kane', '534', 'kane@linch.com'],
    ];

    const onContinue = jest.fn();
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
        </ModalWrapper>
      </Providers>,
    );

    const firstSelect = screen.getByLabelText(header[0]);

    await userEvent.click(firstSelect);

    fields.forEach((field) => {
      expect(screen.queryByText(field.label)).toBeInTheDocument();
    });
  });

  test('Manually matches first column', async () => {
    const header = ['Something random', 'Phone', 'Email'];
    const data = [
      ['John', '123', 'j@j.com'],
      ['Dane', '333', 'dane@bane.com'],
      ['Kane', '534', 'kane@linch.com'],
    ];
    const result = [
      { name: data[0][0] },
      { name: data[1][0] },
      { name: data[2][0] },
    ];

    const onContinue = jest.fn();
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
          <div id={SELECT_DROPDOWN_ID} />
        </ModalWrapper>
      </Providers>,
    );

    await selectEvent.select(
      screen.getByLabelText(header[0]),
      fields[0].label,
      {
        container: document.getElementById(SELECT_DROPDOWN_ID)!,
      },
    );

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    });

    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(onContinue).toBeCalled();
    });
    expect(onContinue.mock.calls[0][0]).toEqual(result);
  });

  test('Checkmark changes when field is matched', async () => {
    const header = ['Something random', 'Phone', 'Email'];
    const data = [
      ['John', '123', 'j@j.com'],
      ['Dane', '333', 'dane@bane.com'],
      ['Kane', '534', 'kane@linch.com'],
    ];

    const onContinue = jest.fn();
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
          <div id={SELECT_DROPDOWN_ID} />
        </ModalWrapper>
      </Providers>,
    );

    const checkmark = screen.getAllByTestId('column-checkmark')[0];
    // kinda dumb way to check if it has checkmark or not
    expect(checkmark).toBeEmptyDOMElement();

    await selectEvent.select(
      screen.getByLabelText(header[0]),
      fields[0].label,
      {
        container: document.getElementById(SELECT_DROPDOWN_ID)!,
      },
    );

    expect(checkmark).not.toBeEmptyDOMElement();
  });

  test('Selecting select field adds more selects', async () => {
    const OPTION_ONE = 'one';
    const OPTION_TWO = 'two';
    const OPTION_RESULT_ONE = 'uno';
    const OPTION_RESULT_TWO = 'dos';
    const options = [
      { label: 'One', value: OPTION_RESULT_ONE },
      { label: 'Two', value: OPTION_RESULT_TWO },
    ];
    const header = ['Something random'];
    const data = [[OPTION_ONE], [OPTION_TWO], [OPTION_ONE]];

    const result = [
      {
        team: OPTION_RESULT_ONE,
      },
      {
        team: OPTION_RESULT_TWO,
      },
      {
        team: OPTION_RESULT_ONE,
      },
    ];

    const enumFields = [
      {
        icon: null,
        label: 'Team',
        key: 'team',
        fieldType: {
          type: 'select',
          options: options,
        },
      },
    ] as const;

    const onContinue = jest.fn();
    render(
      <Providers
        theme={defaultTheme}
        rsiValues={{ ...mockRsiValues, fields: enumFields }}
      >
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
          <div id={SELECT_DROPDOWN_ID} />
        </ModalWrapper>
      </Providers>,
    );

    expect(screen.queryByTestId('accordion-button')).not.toBeInTheDocument();

    await selectEvent.select(
      screen.getByLabelText(header[0]),
      enumFields[0].label,
      {
        container: document.getElementById(SELECT_DROPDOWN_ID)!,
      },
    );

    expect(screen.queryByTestId('accordion-button')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('accordion-button'));

    await selectEvent.select(
      screen.getByLabelText(data[0][0]),
      options[0].label,
      {
        container: document.getElementById(SELECT_DROPDOWN_ID)!,
      },
    );

    await selectEvent.select(
      screen.getByLabelText(data[1][0]),
      options[1].label,
      {
        container: document.getElementById(SELECT_DROPDOWN_ID)!,
      },
    );

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    });

    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(onContinue).toBeCalled();
    });
    expect(onContinue.mock.calls[0][0]).toEqual(result);
  });

  test('Can ignore columns', async () => {
    const header = ['Something random', 'Phone', 'Email'];
    const data = [
      ['John', '123', 'j@j.com'],
      ['Dane', '333', 'dane@bane.com'],
      ['Kane', '534', 'kane@linch.com'],
    ];

    const onContinue = jest.fn();
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
        </ModalWrapper>
      </Providers>,
    );

    const ignoreButton = screen.getAllByLabelText('Ignore column')[0];

    expect(
      screen.queryByText(translations.matchColumnsStep.ignoredColumnText),
    ).not.toBeInTheDocument();

    await userEvent.click(ignoreButton);

    expect(
      screen.queryByText(translations.matchColumnsStep.ignoredColumnText),
    ).toBeInTheDocument();
  });

  test('Required unselected fields show warning alert on submit', async () => {
    const header = ['Something random', 'Phone', 'Email'];
    const data = [
      ['John', '123', 'j@j.com'],
      ['Dane', '333', 'dane@bane.com'],
      ['Kane', '534', 'kane@linch.com'],
    ];

    const requiredFields = [
      {
        icon: null,
        label: 'Name',
        key: 'name',
        fieldType: {
          type: 'input',
        },
        example: 'Stephanie',
        validations: [
          {
            rule: 'required',
            errorMessage: 'Hello',
          },
        ],
      },
    ] as const;

    const onContinue = jest.fn();
    render(
      <Providers
        theme={defaultTheme}
        rsiValues={{ ...mockRsiValues, fields: requiredFields }}
      >
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
        </ModalWrapper>
      </Providers>,
    );

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    });

    await userEvent.click(nextButton);

    expect(onContinue).not.toBeCalled();
    expect(
      screen.queryByText(translations.alerts.unmatchedRequiredFields.bodyText),
    ).toBeInTheDocument();

    const continueButton = screen.getByRole('button', {
      name: 'Continue',
    });

    await userEvent.click(continueButton);

    await waitFor(() => {
      expect(onContinue).toBeCalled();
    });
  });

  test('Selecting the same field twice shows toast', async () => {
    const header = ['Something random', 'Phone', 'Email'];
    const data = [
      ['John', '123', 'j@j.com'],
      ['Dane', '333', 'dane@bane.com'],
      ['Kane', '534', 'kane@linch.com'],
    ];

    const onContinue = jest.fn();
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep
            headerValues={header}
            data={data}
            onContinue={onContinue}
          />
          <div id={SELECT_DROPDOWN_ID} />
        </ModalWrapper>
      </Providers>,
    );

    await selectEvent.select(
      screen.getByLabelText(header[0]),
      fields[0].label,
      {
        container: document.getElementById(SELECT_DROPDOWN_ID)!,
      },
    );
    await selectEvent.select(
      screen.getByLabelText(header[1]),
      fields[0].label,
      {
        container: document.getElementById(SELECT_DROPDOWN_ID)!,
      },
    );

    const toasts = await screen.queryAllByText(
      translations.matchColumnsStep.duplicateColumnWarningDescription,
    );

    expect(toasts?.[0]).toBeInTheDocument();
  });

  test('matchColumnsStepHook should be called after columns are matched', async () => {
    const matchColumnsStepHook = jest.fn(async (values) => values);
    const mockValues = {
      ...mockRsiValues,
      fields: mockRsiValues.fields.filter(
        (field) => field.key === 'name' || field.key === 'age',
      ),
    };
    render(
      <ReactSpreadsheetImport
        {...mockValues}
        matchColumnsStepHook={matchColumnsStepHook}
        initialStepState={{
          type: StepType.matchColumns,
          data: [
            ['Josh', '2'],
            ['Charlie', '3'],
            ['Lena', '50'],
          ],
          headerValues: ['name', 'age'],
        }}
      />,
    );

    const continueButton = screen.getByText(CONTINUE_BUTTON);
    await userEvent.click(continueButton);

    await waitFor(() => {
      expect(matchColumnsStepHook).toBeCalled();
    });
  });

  test('matchColumnsStepHook mutations to rawData should show up in ValidationStep', async () => {
    const matchColumnsStepHook = jest.fn(async ([firstEntry, ...values]) => {
      return [{ ...firstEntry, name: MUTATED_ENTRY }, ...values];
    });
    const mockValues = {
      ...mockRsiValues,
      fields: mockRsiValues.fields.filter(
        (field) => field.key === 'name' || field.key === 'age',
      ),
    };
    render(
      <ReactSpreadsheetImport
        {...mockValues}
        matchColumnsStepHook={matchColumnsStepHook}
        initialStepState={{
          type: StepType.matchColumns,
          data: [
            ['Josh', '2'],
            ['Charlie', '3'],
            ['Lena', '50'],
          ],
          headerValues: ['name', 'age'],
        }}
      />,
    );

    const continueButton = screen.getByText(CONTINUE_BUTTON);
    await userEvent.click(continueButton);

    const mutatedEntry = await screen.findByText(MUTATED_ENTRY);
    expect(mutatedEntry).toBeInTheDocument();
  });

  test('Should show error toast if error is thrown in matchColumnsStepHook', async () => {
    const matchColumnsStepHook = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
      return undefined as any;
    });

    const mockValues = {
      ...mockRsiValues,
      fields: mockRsiValues.fields.filter(
        (field) => field.key === 'name' || field.key === 'age',
      ),
    };

    render(
      <ReactSpreadsheetImport
        {...mockValues}
        matchColumnsStepHook={matchColumnsStepHook}
        initialStepState={{
          type: StepType.matchColumns,
          data: [
            ['Josh', '2'],
            ['Charlie', '3'],
            ['Lena', '50'],
          ],
          headerValues: ['name', 'age'],
        }}
      />,
    );

    const continueButton = screen.getByText(CONTINUE_BUTTON);
    await userEvent.click(continueButton);

    const errorToast = await screen.findAllByText(ERROR_MESSAGE, undefined, {
      timeout: 5000,
    });
    expect(errorToast?.[0]).toBeInTheDocument();
  });
});
