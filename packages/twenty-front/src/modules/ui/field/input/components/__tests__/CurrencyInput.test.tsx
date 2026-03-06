import { render } from '@testing-library/react';
import React from 'react';

import { NumberFormat } from '@/localization/constants/NumberFormat';
import { CurrencyInput } from '@/ui/field/input/components/CurrencyInput';

jest.mock('@/localization/hooks/useNumberFormat', () => ({
  useNumberFormat: jest.fn(),
}));

jest.mock('react-imask', () => ({
  IMaskInput: jest.fn((props: any) => <input {...props} />),
}));

describe('CurrencyInput', () => {
  const mockUseNumberFormat = require('@/localization/hooks/useNumberFormat')
    .useNumberFormat as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const commonProps = {
    instanceId: 'test-id',
    value: '1234.56',
    currencyCode: 'EUR',
    onEnter: jest.fn(),
    onEscape: jest.fn(),
    onClickOutside: jest.fn(),
  };

  it('uses comma as decimal and space as thousands separator for SPACES_AND_COMMA format', () => {
    const { IMaskInput } = require('react-imask');

    mockUseNumberFormat.mockReturnValue({
      numberFormat: NumberFormat.SPACES_AND_COMMA,
      formatNumber: jest.fn(),
    });

    render(<CurrencyInput {...commonProps} />);

    const firstCallArgs = (IMaskInput as jest.Mock).mock.calls[0][0];

    expect(firstCallArgs.thousandsSeparator).toBe(' ');
    expect(firstCallArgs.radix).toBe(',');
  });

  it('uses dot as decimal and comma as thousands separator for COMMAS_AND_DOT format', () => {
    const { IMaskInput } = require('react-imask');

    mockUseNumberFormat.mockReturnValue({
      numberFormat: NumberFormat.COMMAS_AND_DOT,
      formatNumber: jest.fn(),
    });

    render(<CurrencyInput {...commonProps} />);

    const firstCallArgs = (IMaskInput as jest.Mock).mock.calls[0][0];

    expect(firstCallArgs.thousandsSeparator).toBe(',');
    expect(firstCallArgs.radix).toBe('.');
  });
});

