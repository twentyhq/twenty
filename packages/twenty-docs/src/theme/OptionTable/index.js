import styles from "./style.module.css";
import React from "react";

export default function OptionTable({ options }) {
  return (
    <div className={styles.container}>
      <table className={styles.optionsTable}>
        <thead className={styles.tableHeader}>
          <tr className={styles.tableHeaderRow}>
            <th className={styles.tableHeaderCell}>Variable</th>
            <th className={styles.tableHeaderCell}>Example</th>
            <th className={styles.tableHeaderCell}>Description</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {options.map(([option, example, description]) => (
            <tr key={option} className={styles.tableRow}>
              <td className={styles.tableOptionCell}>
                {option}
              </td>
              <td className={styles.tableDescriptionCell}>{example}</td>
              <td className={styles.tableDescriptionCell}>{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
