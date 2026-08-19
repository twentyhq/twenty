import { FieldMetadataType } from "twenty-shared/types";
import { computeWhereConditionParts } from "../compute-where-condition-parts";

describe("computeWhereConditionParts", () => {
  it("generates strict equality condition for cursor keyset without null widening", () => {
    const res = computeWhereConditionParts({
      operator: "eqStrict",
      objectNameSingular: "company",
      key: "name",
      value: "Acme",
      fieldMetadataType: FieldMetadataType.TEXT,
    });

    expect(res.sql).toMatch(/^"company"\."name" = :name[a-f0-9]+$/);
    expect(res.sql).not.toContain("IS NULL");
    const paramKey = Object.keys(res.params)[0];
    expect(res.params[paramKey]).toBe("Acme");
  });

  it("generates strict IS NULL condition for cursor continuation without fallback", () => {
    const res = computeWhereConditionParts({
      operator: "isStrictly",
      objectNameSingular: "company",
      key: "domainName",
      value: "NULL",
      fieldMetadataType: FieldMetadataType.LINKS,
    });

    expect(res.sql).toBe('"company"."domainName" IS NULL');
    expect(Object.keys(res.params).length).toBe(0);
  });
});
