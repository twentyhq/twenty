/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';

import {
  FormFieldInputRowContainer,
  LINE_HEIGHT,
} from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';

const mockTheme = {
  spacing: (multiplier: number) => `${multiplier * 4}px`,
  font: {
    size: { md: '14px' },
    color: { secondary: 'rgb(102, 102, 102)' },
  },
  border: {
    color: {
      strong: 'rgb(204, 204, 204)',
      medium: 'rgb(204, 204, 204)',
      light: 'rgb(204, 204, 204)',
      secondaryInverted: 'rgb(204, 204, 204)',
      inverted: 'rgb(204, 204, 204)',
      danger: 'rgb(204, 204, 204)',
      blue: 'rgb(204, 204, 204)',
    },
    radius: {
      xs: '2px',
      sm: '4px',
      md: '8px',
      xl: '20px',
      xxl: '40px',
      pill: '999px',
      rounded: '100%',
    },
  },
};

describe('FormFieldInputRowContainer', () => {
  const renderComponent = (
    props: { multiline?: boolean; maxHeight?: number } = {},
  ) => {
    return render(
      <ThemeProvider theme={mockTheme as any}>
        <FormFieldInputRowContainer
          multiline={props.multiline}
          maxHeight={props.maxHeight}
        >
          <div data-testid="child-content">Test Content</div>
        </FormFieldInputRowContainer>
      </ThemeProvider>,
    );
  };

  it('should render children correctly', () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId('child-content')).toBeInTheDocument();
    expect(getByTestId('child-content')).toHaveTextContent('Test Content');
  });

  it('should apply default styles for single line', () => {
    const { container } = renderComponent();
    const element = container.firstChild as HTMLElement;

    expect(element).toHaveStyle({
      display: 'flex',
      'flex-direction': 'row',
      position: 'relative',
    });
  });

  it('should apply single line height when multiline is false', () => {
    const { container } = renderComponent({ multiline: false });
    const element = container.firstChild as HTMLElement;

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.height).toBe('32px');
  });

  it('should apply multiline styles when multiline is true', () => {
    const { container } = renderComponent({ multiline: true });
    const element = container.firstChild as HTMLElement;

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.lineHeight).toBe(`${LINE_HEIGHT}px`);
    expect(computedStyle.minHeight).toBe(`${3 * LINE_HEIGHT}px`);
    expect(computedStyle.maxHeight).toBe(`${5 * LINE_HEIGHT}px`); // default
  });

  it('should use custom maxHeight when provided with multiline', () => {
    const customMaxHeight = 200;
    const { container } = renderComponent({
      multiline: true,
      maxHeight: customMaxHeight,
    });
    const element = container.firstChild as HTMLElement;

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.maxHeight).toBe(`${customMaxHeight}px`);
    expect(computedStyle.minHeight).toBe(`${3 * LINE_HEIGHT}px`);
    expect(computedStyle.lineHeight).toBe(`${LINE_HEIGHT}px`);
  });

  it('should ignore maxHeight when multiline is false', () => {
    const { container } = renderComponent({
      multiline: false,
      maxHeight: 200,
    });
    const element = container.firstChild as HTMLElement;

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.height).toBe('32px');
    // maxHeight should not be applied in single line mode
  });

  it('should use default maxHeight when maxHeight is not provided in multiline mode', () => {
    const { container } = renderComponent({ multiline: true });
    const element = container.firstChild as HTMLElement;

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.maxHeight).toBe(`${5 * LINE_HEIGHT}px`);
  });

  it('should handle maxHeight of 0', () => {
    const { container } = renderComponent({
      multiline: true,
      maxHeight: 0,
    });
    const element = container.firstChild as HTMLElement;

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.maxHeight).toBe('0px');
  });

  it('should handle very large maxHeight values', () => {
    const largeMaxHeight = 1000;
    const { container } = renderComponent({
      multiline: true,
      maxHeight: largeMaxHeight,
    });
    const element = container.firstChild as HTMLElement;

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.maxHeight).toBe(`${largeMaxHeight}px`);
  });

  it('should maintain consistent LINE_HEIGHT constant', () => {
    expect(LINE_HEIGHT).toBe(24);
  });

  it('should calculate default maxHeight correctly', () => {
    const expectedDefaultMaxHeight = 5 * LINE_HEIGHT; // 5 * 24 = 120px
    const { container } = renderComponent({ multiline: true });
    const element = container.firstChild as HTMLElement;

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.maxHeight).toBe(`${expectedDefaultMaxHeight}px`);
  });

  it('should calculate minHeight correctly', () => {
    const expectedMinHeight = 3 * LINE_HEIGHT; // 3 * 24 = 72px
    const { container } = renderComponent({ multiline: true });
    const element = container.firstChild as HTMLElement;

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.minHeight).toBe(`${expectedMinHeight}px`);
  });

  it('should handle decimal maxHeight values', () => {
    const decimalMaxHeight = 150.5;
    const { container } = renderComponent({
      multiline: true,
      maxHeight: decimalMaxHeight,
    });
    const element = container.firstChild as HTMLElement;

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.maxHeight).toBe(`${decimalMaxHeight}px`);
  });

  it('should apply correct styles when switching from single to multiline', () => {
    const { container, rerender } = renderComponent({ multiline: false });
    let element = container.firstChild as HTMLElement;

    // Initially single line
    let computedStyle = window.getComputedStyle(element);
    expect(computedStyle.height).toBe('32px');

    // Switch to multiline
    rerender(
      <ThemeProvider theme={mockTheme as any}>
        <FormFieldInputRowContainer multiline={true}>
          <div data-testid="child-content">Test Content</div>
        </FormFieldInputRowContainer>
      </ThemeProvider>,
    );

    element = container.firstChild as HTMLElement;
    computedStyle = window.getComputedStyle(element);
    expect(computedStyle.lineHeight).toBe(`${LINE_HEIGHT}px`);
    expect(computedStyle.minHeight).toBe(`${3 * LINE_HEIGHT}px`);
    expect(computedStyle.maxHeight).toBe(`${5 * LINE_HEIGHT}px`);
  });
});
