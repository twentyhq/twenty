type OnChangeCallback = (cssText: string) => void;

class MockCSSRule {
  cssText: string;

  constructor(cssText: string) {
    this.cssText = cssText;
  }
}

class MockCSSRuleList extends Array<MockCSSRule> {
  item(index: number): MockCSSRule | null {
    return this[index] ?? null;
  }
}

export class MockCSSStyleSheet {
  cssRules = new MockCSSRuleList();
  private onChange: OnChangeCallback;

  constructor(onChange: OnChangeCallback) {
    this.onChange = onChange;
  }

  insertRule(rule: string, index?: number): number {
    const insertAt = index ?? this.cssRules.length;
    this.cssRules.splice(insertAt, 0, new MockCSSRule(rule));
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
