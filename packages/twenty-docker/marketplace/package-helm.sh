#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
HELM_CHART_DIR="$REPO_ROOT/packages/twenty-docker/helm/twenty"
BUILD_DIR="$SCRIPT_DIR/build"

echo "========================================="
echo "Twenty CRM - Cloud Marketplace Helm Packager"
echo "========================================="
echo "Root directory: $REPO_ROOT"
echo "Helm chart:     $HELM_CHART_DIR"
echo "Build output:   $BUILD_DIR"
echo "-----------------------------------------"

# 1. Validation Checks
if ! command -v helm &> /dev/null; then
    echo "Error: helm is not installed. Please install Helm 3 first."
    exit 1
fi

echo "Step 1: Running Helm Lint..."
helm lint "$HELM_CHART_DIR"
echo "Linting complete!"
echo ""

echo "Step 2: Testing Helm template rendering..."
mkdir -p "$BUILD_DIR"
helm template test-release "$HELM_CHART_DIR" > "$BUILD_DIR/templated-dryrun.yaml"
echo "Dry-run template output saved to $BUILD_DIR/templated-dryrun.yaml"
echo ""

# 2. Package Chart
echo "Step 3: Packaging Helm chart..."
helm package "$HELM_CHART_DIR" --destination "$BUILD_DIR"
CHART_FILE=$(find "$BUILD_DIR" -name "twenty-*.tgz" -type f | head -n 1)
CHART_NAME=$(basename "$CHART_FILE")
echo "Successfully packaged chart: $CHART_NAME"
echo ""

# 3. Print Registry Instructions
echo "========================================="
echo "Registry Push Instructions"
echo "========================================="
echo ""
echo "--- GOOGLE CLOUD MARKETPLACE (GCP Artifact Registry) ---"
echo "1. Authenticate Helm with GCP:"
echo "   gcloud auth configure-docker <REGION>-docker.pkg.dev"
echo ""
echo "2. Push Helm OCI Artifact:"
echo "   helm push \"$BUILD_DIR/$CHART_NAME\" oci://<REGION>-docker.pkg.dev/<PROJECT_ID>/<REPOSITORY_NAME>"
echo ""
echo "--- AWS MARKETPLACE (Amazon ECR) ---"
echo "1. Authenticate Helm with ECR (AWS CLI v2):"
echo "   aws ecr get-login-password --region <REGION> | helm registry login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com"
echo ""
echo "2. Push Helm OCI Artifact:"
echo "   helm push \"$BUILD_DIR/$CHART_NAME\" oci://<AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/<REPOSITORY_NAME>"
echo "========================================="
