type OnChangeCallback = (cssText: string) => void;

class MockCssRule {
  cssText: string;

  constructor(cssText: string) {
    this.cssText = cssText;
  }
}

class MockCssRuleList extends Array<MockCssRule> {
  item(index: number): MockCssRule | null {
    return this[index] ?? null;
  }
}

class MockCssStyleSheet {
  cssRules = new MockCssRuleList();
  private onChange: OnChangeCallback;

  constructor(onChange: OnChangeCallback) {
    this.onChange = onChange;
  }

  insertRule(rule: string, index?: number): number {
    const insertAt = index ?? this.cssRules.length;
    this.cssRules.splice(insertAt, 0, new MockCssRule(rule));
    this.notify();
    return insertAt;
  }

  deleteRule(index: number): void {
    this.cssRules.splice(index, 1);
    this.notify();
  }

  private notify(): void {
    const cssText = this.cssRules.map((rule) => rule.cssText).join('\n');
    this.onChange(cssText);
  }
}

export const createMockCssStyleSheet = (
  onChange: OnChangeCallback,
): CSSStyleSheet =>
  new MockCssStyleSheet(onChange) as unknown as CSSStyleSheet;
