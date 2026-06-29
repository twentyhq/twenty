# Twenty CRM - Cloud Marketplace Publication Guide

This folder contains assets and helper configurations to deploy, package, and list Twenty CRM on the **AWS Marketplace** (EKS Container Product) and **Google Cloud Marketplace** (GKE Container/Helm Application).

---

## 1. Quick Validation & Packaging

To validate the Helm chart and package it into a `.tgz` archive suitable for marketplace distribution:

1. Make the script executable:
   ```bash
   chmod +x packages/twenty-docker/marketplace/package-helm.sh
   ```
2. Run the packager:
   ```bash
   ./packages/twenty-docker/marketplace/package-helm.sh
   ```

This will run `helm lint` to check for chart syntax issues, perform a dry-run compile using `helm template` (output saved to `packages/twenty-docker/marketplace/build/templated-dryrun.yaml`), and output the final package to `packages/twenty-docker/marketplace/build/twenty-0.1.0.tgz`.

---

## 2. Google Cloud Marketplace Integration

GCP Marketplace deploys applications directly from **Artifact Registry** Helm repositories.

### Pipeline Steps:
1. **Configure GCP Artifact Registry**:
   Create a standard Docker/Helm repository in your GCP publisher project:
   ```bash
   gcloud artifacts repositories create twenty-helm-repo \
     --repository-format=docker \
     --location=us-central1 \
     --description="Twenty CRM Helm Marketplace Registry"
   ```

2. **Authenticate Local Helm**:
   ```bash
   gcloud auth configure-docker us-central1-docker.pkg.dev
   ```

3. **Push Chart OCI Artifact**:
   ```bash
   helm push packages/twenty-docker/marketplace/build/twenty-0.1.0.tgz oci://us-central1-docker.pkg.dev/<PROJECT_ID>/twenty-helm-repo
   ```

4. **Define Launcher Configuration**:
   Use the templates in `gcp-marketplace-config.yaml` to set up the checkout UI in the GCP Producer Portal. This maps customer inputs directly to your `values.yaml` fields (e.g. host domain, database options, storage types).

---

## 3. AWS Marketplace EKS Integration

AWS Marketplace Container products require OCI-compliant Helm charts and container images pushed exclusively to the **AWS Marketplace ECR repositories**.

### Pipeline Steps:
1. **Request Repository Mappings**:
   AWS will assign your Seller account specific ECR URIs for:
   * The Helm chart: `709825985650.dkr.ecr.us-east-1.amazonaws.com/your-org/twenty-chart`
   * The main application image: `709825985650.dkr.ecr.us-east-1.amazonaws.com/your-org/twenty-app`

2. **Login to AWS Marketplace ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | helm registry login --username AWS --password-stdin 709825985650.dkr.ecr.us-east-1.amazonaws.com
   ```

3. **Push OCI Helm Chart**:
   ```bash
   helm push packages/twenty-docker/marketplace/build/twenty-0.1.0.tgz oci://709825985650.dkr.ecr.us-east-1.amazonaws.com/your-org/twenty-chart
   ```

4. **Synchronize Schema**:
   Review and fill out `aws-marketplace-schema.json` with categories, versions, support info, and ECR repository mappings to submit via the AWS Seller Central console.

---

## 4. Production Security Scanning (Mandatory)

Both AWS and GCP scan all submitted container images and Helm charts for CVEs (vulnerabilities).
* Ensure you perform container image vulnerability scans (e.g., using `trivy` or `snyk`) on your `twentycrm/twenty` images *prior* to registry uploads.
* Listings with **Critical** or unmitigated **High** severity CVEs will be automatically blocked by cloud platform reviewers.
